import { db } from "../database/index";
import { users } from "../database/schema";
import { eq } from "drizzle-orm";


export default class User {
    id: number;
    email: string;
    fullName: string | null;
    passwordHash: string;
    createdAt: Date;
    constructor(id: number, email: string, fullName: string | null, passwordHash: string, createdAt: Date) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.passwordHash = passwordHash;
        this.createdAt = createdAt;
    }
   static async createUser(userData: {
    email: string;
    fullName?: string;
    passwordHash: string;
  }): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values(userData)
      .returning();

    return new User(
      newUser.id,
      newUser.email,
      newUser.fullName,
      newUser.passwordHash,
      newUser.createdAt
    );
  }
  static async findByEmail(email: string): Promise<User | null> {
    const userRow = await db.select().from(users).where(eq(users.email, email)).then(rows => rows[0]);
    if (!userRow) return null;

    return new User(
      userRow.id,
      userRow.email,
      userRow.fullName,
      userRow.passwordHash,
      userRow.createdAt
    );
  }
}
