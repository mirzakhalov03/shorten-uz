import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendCaughtError, sendError } from '../services/errorResponse';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshUserAccessToken,
  registerUser,
} from '../services/auth.service';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, fullName, password } = req.body;
    if (!email || !fullName || !password) {
      sendError(res, 400, 'Please provide email, full name, and password.', {
        devMessage:
          'Missing one or more required fields: email, fullName, password',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await registerUser({ email, fullName, password });

    res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    sendCaughtError(res, err, 'Unable to create your account right now.');
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendError(res, 400, 'Please provide both email and password.', {
        devMessage: 'Missing required fields: email and/or password',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const result = await loginUser({ email, password });

    res.json({
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
  } catch (err) {
    sendCaughtError(res, err, 'Unable to sign you in right now.');
  }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      sendError(res, 400, 'Session token is required.', {
        devMessage: 'Missing refreshToken in request body',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    const tokens = await refreshUserAccessToken(refreshToken);

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    sendCaughtError(res, err, 'Unable to refresh your session right now.');
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    await logoutUser(req.userId);

    res.json({ message: 'Logged out' });
  } catch (err) {
    sendCaughtError(res, err, 'Unable to log out right now.');
  }
};

export const me = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId;
    if (!userId) {
      sendError(res, 401, 'Please sign in to continue.', {
        devMessage: 'Missing req.userId in me endpoint',
        code: 'AUTH_UNAUTHORIZED',
      });
      return;
    }

    const result = await getCurrentUser(userId);
    res.json(result);
  } catch (err) {
    sendCaughtError(res, err, 'Unable to load your profile right now.');
  }
};
