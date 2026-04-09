import { Request, Response } from "express";
import { nanoid } from "nanoid";
import { db } from "../database";
import { urls } from "../database/schema";
import { eq, and } from "drizzle-orm";
import { AuthRequest } from "../middleware/auth";
import { getErrorMessage, sendError } from "../services/error-response";
import { validateHttpUrlOrSendError } from "../helpers/urlUtils";

export const createShortLink = async (req: AuthRequest, res: Response) => {
  try {
    const { originalLink } = req.body;
    if (!originalLink) {
      sendError(res, 400, "Please provide a URL to shorten.", {
        devMessage: "Missing required field: originalLink",
        code: "VALIDATION_ERROR",
      });
      return;
    }

    if (!validateHttpUrlOrSendError(res, originalLink)) {
      return;
    }

    const shortLink = nanoid(8);

    const [link] = await db
      .insert(urls)
      .values({
        originalLink,
        shortLink,
        userId: req.userId ?? null,
      })
      .returning();

    res.status(201).json(link);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Something went wrong while creating the short link.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const getUserLinks = async (req: AuthRequest, res: Response) => {
  try {
    const links = await db.query.urls.findMany({
      where: eq(urls.userId, req.userId!),
      orderBy: (urls, { desc }) => [desc(urls.createdAt)],
    });

    res.json(links);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to load your links right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const redirect = async (req: Request, res: Response) => {
  try {
    const shortLink = req.params.shortLink as string;

    const link = await db.query.urls.findFirst({
      where: (urls, { eq }) => eq(urls.shortLink, shortLink),
    });

    if (!link) {
      sendError(res, 404, "This short link does not exist.", {
        devMessage: `No URL found for short link: ${shortLink}`,
        code: "NOT_FOUND",
      });
      return;
    }

    res.redirect(link.originalLink);
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to open that link right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};

export const deleteLink = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;

    const [deleted] = await db
      .delete(urls)
      .where(and(eq(urls.id, id), eq(urls.userId, req.userId!)))
      .returning();

    if (!deleted) {
      sendError(res, 404, "We could not find that link.", {
        devMessage: `No link found for id=${id} and userId=${req.userId}`,
        code: "NOT_FOUND",
      });
      return;
    }

    res.json({ message: "Deleted", link: deleted });
  } catch (err) {
    console.error(err);
    sendError(res, 500, "Unable to delete the link right now.", {
      devMessage: getErrorMessage(err),
      code: "INTERNAL_ERROR",
    });
  }
};
