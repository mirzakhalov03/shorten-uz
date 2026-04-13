import { and, eq } from "drizzle-orm";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { db } from "../database";
import { urls } from "../database/schema";

type LinkRow = InferSelectModel<typeof urls>;
type NewLinkInput = InferInsertModel<typeof urls>;

export default class Link {
  static async createLink(input: NewLinkInput): Promise<LinkRow> {
    const [link] = await db.insert(urls).values(input).returning();
    return link;
  }

  static async findManyByUserId(userId: number): Promise<LinkRow[]> {
    return await db.query.urls.findMany({
      where: eq(urls.userId, userId),
      orderBy: (table, { desc }) => [desc(table.createdAt)],
    });
  }

  static async findByShortLink(shortLink: string): Promise<LinkRow | null> {
    const link = await db.query.urls.findFirst({
      where: eq(urls.shortLink, shortLink),
    });

    if (!link) return null;

    return link;
  }

  static async deleteByIdAndUserId(id: string, userId: number): Promise<LinkRow | null> {
    const [deleted] = await db
      .delete(urls)
      .where(and(eq(urls.id, id), eq(urls.userId, userId)))
      .returning();

    if (!deleted) return null;

    return deleted;
  }
}