ALTER TABLE "users" DROP CONSTRAINT "users_access_token_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_refresh_token_unique";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "access_token";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "refresh_token";