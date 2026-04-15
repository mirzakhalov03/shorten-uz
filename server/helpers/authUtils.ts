import bcrypt from 'bcrypt';
import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { sendError } from '../services/errorResponse';

export const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const getSessionExpirationDate = (from: Date = new Date()) =>
  new Date(from.getTime() + REFRESH_TOKEN_TTL_MS);

export const isPasswordValid = async (
  password: string,
  userPasswordHash: string,
) => await bcrypt.compare(password, userPasswordHash);

export const validatePasswordOrSendError = async (
  res: Response,
  password: string,
  userPasswordHash: string,
  userId: number,
) => {
  const valid = await isPasswordValid(password, userPasswordHash);
  if (!valid) {
    sendError(res, 401, 'Invalid email or password.', {
      devMessage: `Login failed: invalid password for userId ${userId}`,
      code: 'AUTH_INVALID_CREDENTIALS',
    });
    return false;
  }

  return true;
};

export const verifyRefreshTokenOrSendError = (
  res: Response,
  refreshToken: string,
): { userId: number } | null => {
  try {
    return jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      userId: number;
    };
  } catch {
    sendError(res, 401, 'Your session is invalid. Please sign in again.', {
      devMessage: 'JWT refresh token verification failed',
      code: 'AUTH_INVALID_REFRESH_TOKEN',
    });
    return null;
  }
};

export const extractBearerToken = (
  authorizationHeader?: string,
): string | null => {
  if (!authorizationHeader?.startsWith('Bearer ')) {
    return null;
  }

  return authorizationHeader.split(' ')[1] ?? null;
};

export const verifyAccessToken = (token: string): { userId: number } | null => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
  } catch {
    return null;
  }
};

export const isExpired = (timestamp: Date) => timestamp < new Date();
