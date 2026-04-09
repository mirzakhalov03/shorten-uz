import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { db } from "../database";
import { users, sessions } from "../database/schema";
import { eq } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { getErrorMessage, sendError } from "../services/error-response";
import { isExpired, validatePasswordOrSendError, verifyRefreshTokenOrSendError } from "../helpers/authUtils";


const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
  const refreshToken = jwt.sign(
    { userId, tokenId: randomUUID() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      sendError(res, 400, "Please provide email, full name, and password.", {
        devMessage: "Missing one or more required fields: email, fullName, password",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const existing = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (existing) {
      sendError(res, 409, "This email is already registered.", {
        devMessage: `Duplicate email during registration: ${email}`,
        code: "CONFLICT",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const { accessToken, refreshToken } = generateTokens(0); // temp id

    const [user] = await db.insert(users).values({
      email,
      fullName,
      passwordHash,
      accessToken,
      refreshToken,
    }).returning();

    const tokens = generateTokens(user.id);

    await db.update(users).set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }).where(eq(users.id, user.id));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt,
    });

    res.status(201).json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to create your account right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, 400, "Please provide both email and password.", {
        devMessage: "Missing required fields: email and/or password",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (!user) {
      sendError(res, 401, "Invalid email or password.", {
        devMessage: `Login failed: user not found for email ${email}`,
        code: "AUTH_INVALID_CREDENTIALS",
      });
      return;
    }

    if (!(await validatePasswordOrSendError(res, password, user.passwordHash, user.id))) return;

    const tokens = generateTokens(user.id);

    await db.update(users).set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }).where(eq(users.id, user.id));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt,
    });

    res.json({
      user: { id: user.id, email: user.email, fullName: user.fullName },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to sign you in right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 400, "Session token is required.", {
        devMessage: "Missing refreshToken in request body",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    const payload = verifyRefreshTokenOrSendError(res, refreshToken);
    if (!payload) {
      return;
    }

    const session = await db.query.sessions.findFirst({
      where: eq(sessions.refreshToken, refreshToken),
    });
    if (!session || isExpired(session.expiresAt)) {
        sendError(res, 401, "Your session has expired. Please sign in again.", {
          devMessage: "Refresh session missing or expired",
          code: "AUTH_SESSION_EXPIRED",
      });
      return;
    }


    await db.delete(sessions).where(eq(sessions.id, session.id));

    const tokens = generateTokens(payload.userId);

    await db.update(users).set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    }).where(eq(users.id, payload.userId));

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      userId: payload.userId,
      refreshToken: tokens.refreshToken,
      expiresAt,
    });

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to refresh your session right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const header = req.headers.authorization;
    const token = header?.split(" ")[1];
    if (token && req.userId) {
      await db.delete(sessions).where(eq(sessions.userId, req.userId));
    }
    res.json({ message: "Logged out" });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to log out right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      sendError(res, 401, "Please sign in to continue.", {
        devMessage: "Missing req.userId in me endpoint",
        code: "AUTH_UNAUTHORIZED",
      });
      return;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      sendError(res, 404, "Account not found.", {
        devMessage: `No user found for userId ${userId}`,
        code: "NOT_FOUND",
      });
      return;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to load your profile right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};
