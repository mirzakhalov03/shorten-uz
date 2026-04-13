import { db } from '../database/index';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

type UserRow = InferSelectModel<typeof users>;
type NewUserInput = InferInsertModel<typeof users>;

export default class User {
  static async createUser(userData: NewUserInput): Promise<UserRow> {
    const [newUser] = await db.insert(users).values(userData).returning();

    return newUser;
  }
  static async findByEmail(email: string): Promise<UserRow | null> {
    const userRow = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!userRow) return null;

    return userRow;
  }

  static async findById(id: number): Promise<UserRow | null> {
    const userRow = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!userRow) return null;

    return userRow;
  }

  static async updateTokens(
    id: number,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    await db
      .update(users)
      .set({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      })
      .where(eq(users.id, id));
  }
}
