import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { sendCaughtError, sendError } from '../services/errorResponse';
import { validateHttpUrlOrSendError } from '../helpers/urlUtils';
import {
  createUrl,
  deleteUserLinkById,
  getLinksByUserId,
  getOriginalLinkByShortCode,
} from '../services/url.service';

export const createShortLink = async (req: AuthRequest, res: Response) => {
  try {
    const { originalLink } = req.body;
    if (!originalLink) {
      sendError(res, 400, 'Please provide a URL to shorten.', {
        devMessage: 'Missing required field: originalLink',
        code: 'VALIDATION_ERROR',
      });
      return;
    }

    if (!validateHttpUrlOrSendError(res, originalLink)) {
      return;
    }

    const link = await createUrl({
      originalLink,
      userId: req.userId,
    });

    res.status(201).json(link);
  } catch (err) {
    sendCaughtError(
      res,
      err,
      'Something went wrong while creating the short link.',
    );
  }
};

export const getUserLinks = async (req: AuthRequest, res: Response) => {
  try {
    const links = await getLinksByUserId(req.userId!);

    res.json(links);
  } catch (err) {
    sendCaughtError(res, err, 'Unable to load your links right now.');
  }
};

export const redirect = async (req: Request, res: Response) => {
  try {
    const shortLink = req.params.shortLink as string;

    const originalLink = await getOriginalLinkByShortCode(shortLink);
    res.redirect(originalLink);
  } catch (err) {
    sendCaughtError(res, err, 'Unable to open that link right now.');
  }
};

export const deleteLink = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const deleted = await deleteUserLinkById(id, req.userId!);

    res.json({ message: 'Deleted', link: deleted });
  } catch (err) {
    sendCaughtError(res, err, 'Unable to delete the link right now.');
  }
};
