import { Response } from 'express';
import { sendError } from '../services/errorResponse';

export const validateHttpUrlOrSendError = (
  res: Response,
  originalLink: string,
): boolean => {
  if (!/^https?:\/\//.test(originalLink)) {
    sendError(
      res,
      400,
      'Please enter a valid URL starting with http:// or https://.',
      {
        devMessage: 'Invalid originalLink format',
        code: 'VALIDATION_ERROR',
      },
    );
    return false;
  }

  return true;
};
