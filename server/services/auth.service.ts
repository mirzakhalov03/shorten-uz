import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { users, sessions } from "../database/schema";
import { AppError } from "./app-error";

type PublicUser = {
  id: number;
  email: string;
  fullName: string | null;
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const generateTokens = (userId: number): AuthTokens => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: "15m" });
  const refreshToken = jwt.sign(
    { userId, tokenId: randomUUID() },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );

  return { accessToken, refreshToken };
};

const createSession = async (userId: number, refreshToken: string) => {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  await db.insert(sessions).values({
    userId,
    refreshToken,
    expiresAt,
  });
};

const toPublicUser = (user: { id: number; email: string; fullName: string | null }): PublicUser => ({
  id: user.id,
  email: user.email,
  fullName: user.fullName,
});

export const registerUser = async (input: {
  email: string;
  fullName: string;
  password: string;
}): Promise<{ user: PublicUser } & AuthTokens> => {
  const existing = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existing) {
    throw new AppError(409, "This email is already registered.", {
      code: "CONFLICT",
      devMessage: `Duplicate email during registration: ${input.email}`,
    });
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const [createdUser] = await db
    .insert(users)
    .values({
      email: input.email,
      fullName: input.fullName,
      passwordHash,
    })
    .returning();

  const tokens = generateTokens(createdUser.id);

  await db
    .update(users)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
    .where(eq(users.id, createdUser.id));

  await createSession(createdUser.id, tokens.refreshToken);

  return {
    user: toPublicUser(createdUser),
    ...tokens,
  };
};

export const loginUser = async (input: {
  email: string;
  password: string;
}): Promise<{ user: PublicUser } & AuthTokens> => {
  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (!user) {
    throw new AppError(401, "Invalid email or password.", {
      code: "AUTH_INVALID_CREDENTIALS",
      devMessage: `Login failed: user not found for email ${input.email}`,
    });
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordValid) {
    throw new AppError(401, "Invalid email or password.", {
      code: "AUTH_INVALID_CREDENTIALS",
      devMessage: `Login failed: invalid password for userId ${user.id}`,
    });
  }

  const tokens = generateTokens(user.id);

  await db
    .update(users)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
    .where(eq(users.id, user.id));

  await createSession(user.id, tokens.refreshToken);

  return {
    user: toPublicUser(user),
    ...tokens,
  };
};

export const refreshUserAccessToken = async (
  refreshToken: string
): Promise<AuthTokens> => {
  let payload: { userId: number };

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: number };
  } catch {
    throw new AppError(401, "Your session is invalid. Please sign in again.", {
      code: "AUTH_INVALID_REFRESH_TOKEN",
      devMessage: "JWT refresh token verification failed",
    });
  }

  const session = await db.query.sessions.findFirst({
    where: eq(sessions.refreshToken, refreshToken),
  });

  if (!session || session.expiresAt < new Date()) {
    throw new AppError(401, "Your session has expired. Please sign in again.", {
      code: "AUTH_SESSION_EXPIRED",
      devMessage: "Refresh session missing or expired",
    });
  }

  await db.delete(sessions).where(eq(sessions.id, session.id));

  const tokens = generateTokens(payload.userId);

  await db
    .update(users)
    .set({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    })
    .where(eq(users.id, payload.userId));

  await createSession(payload.userId, tokens.refreshToken);

  return tokens;
};

export const logoutUser = async (userId?: number) => {
  if (!userId) {
    return;
  }

  await db.delete(sessions).where(eq(sessions.userId, userId));
};

export const getCurrentUser = async (userId: number): Promise<{ user: PublicUser }> => {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

  if (!user) {
    throw new AppError(404, "Account not found.", {
      code: "NOT_FOUND",
      devMessage: `No user found for userId ${userId}`,
    });
  }

  return { user: toPublicUser(user) };
};