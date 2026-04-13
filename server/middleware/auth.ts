import { Request, Response, NextFunction } from 'express';
import { extractBearerToken, verifyAccessToken } from '../helpers/authUtils';
import { sendError } from '../services/errorResponse';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    sendError(res, 401, 'Please sign in to continue.', {
      devMessage: 'Authorization header missing or malformed',
      code: 'AUTH_MISSING_TOKEN',
    });
    return;
  }

  const payload = verifyAccessToken(token);
  if (!payload) {
    sendError(
      res,
      401,
      'Your session is invalid or expired. Please sign in again.',
      {
        devMessage: 'Access token verification failed',
        code: 'AUTH_INVALID_TOKEN',
      },
    );
    return;
  }

  req.userId = payload.userId;
  next();
};

export const optionalAuthenticate = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next();
    return;
  }

  const payload = verifyAccessToken(token);
  if (payload) {
    req.userId = payload.userId;
  } else {
    req.userId = undefined;
  }

  next();
};
