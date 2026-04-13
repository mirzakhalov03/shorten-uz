import { nanoid } from "nanoid";
import { and, eq } from "drizzle-orm";
import { db } from "../database";
import { urls } from "../database/schema";
import { AppError } from "./app-error";

export const createUrl = async (input: { originalLink: string; userId?: number | null }) => {
  const shortLink = nanoid(8);

  const [link] = await db
    .insert(urls)
    .values({
      originalLink: input.originalLink,
      shortLink,
      userId: input.userId ?? null,
    })
    .returning();

  return link;
};

export const getLinksByUserId = async (userId: number) => {
  return await db.query.urls.findMany({
    where: eq(urls.userId, userId),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
};

export const getOriginalLinkByShortCode = async (shortLink: string) => {
  const link = await db.query.urls.findFirst({
    where: eq(urls.shortLink, shortLink),
  });

  if (!link) {
    throw new AppError(404, "This short link does not exist.", {
      code: "NOT_FOUND",
      devMessage: `No URL found for short link: ${shortLink}`,
    });
  }

  return link.originalLink;
};

export const deleteUserLinkById = async (id: string, userId: number) => {
  const [deleted] = await db
    .delete(urls)
    .where(and(eq(urls.id, id), eq(urls.userId, userId)))
    .returning();

  if (!deleted) {
    throw new AppError(404, "We could not find that link.", {
      code: "NOT_FOUND",
      devMessage: `No link found for id=${id} and userId=${userId}`,
    });
  }

  return deleted;
};