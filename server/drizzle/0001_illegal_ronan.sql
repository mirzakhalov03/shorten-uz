CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"full_name" varchar(255) NOT NULL,
	"access_token" varchar(255) NOT NULL,
	"refresh_token" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_access_token_unique" UNIQUE("access_token"),
	CONSTRAINT "users_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
ALTER TABLE "urls" RENAME TO "links";--> statement-breakpoint
ALTER TABLE "links" RENAME COLUMN "short_url" TO "short_link";--> statement-breakpoint
ALTER TABLE "links" RENAME COLUMN "original_url" TO "original_link";--> statement-breakpoint
ALTER TABLE "links" DROP CONSTRAINT "urls_short_url_unique";--> statement-breakpoint
DROP INDEX "urls_user_id_idx";--> statement-breakpoint
ALTER TABLE "links" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "links" ADD CONSTRAINT "links_short_link_unique" UNIQUE("short_link");