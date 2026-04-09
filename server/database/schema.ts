import { relations } from "drizzle-orm";
import { pgTable, serial, varchar, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  fullName: text("full_name"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const urls = pgTable("links", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: integer("user_id"),
  shortLink: text("short_link").notNull().unique(),
  originalLink: text("original_link").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  refreshToken: varchar("refresh_token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  urls: many(urls),
  sessions: many(sessions),
}));

export const urlsRelations = relations(urls, ({ one }) => ({
  user: one(users, { fields: [urls.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
