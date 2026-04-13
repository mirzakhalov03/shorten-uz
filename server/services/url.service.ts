import { nanoid } from "nanoid";
import { AppError } from "./app-error";
import Link from "../models/link";

export const createUrl = async (input: { originalLink: string; userId?: number | null }) => {
  const shortLink = nanoid(8);

  const link = await Link.createLink({
    originalLink: input.originalLink,
    shortLink,
    userId: input.userId ?? null,
  });

  return link;
};

export const getLinksByUserId = async (userId: number) => {
  return await Link.findManyByUserId(userId);
};

export const getOriginalLinkByShortCode = async (shortLink: string) => {
  const link = await Link.findByShortLink(shortLink);

  if (!link) {
    throw new AppError(404, "This short link does not exist.", {
      code: "NOT_FOUND",
      devMessage: `No URL found for short link: ${shortLink}`,
    });
  }

  return link.originalLink;
};

export const deleteUserLinkById = async (id: string, userId: number) => {
  const deleted = await Link.deleteByIdAndUserId(id, userId);

  if (!deleted) {
    throw new AppError(404, "We could not find that link.", {
      code: "NOT_FOUND",
      devMessage: `No link found for id=${id} and userId=${userId}`,
    });
  }

  return deleted;
};