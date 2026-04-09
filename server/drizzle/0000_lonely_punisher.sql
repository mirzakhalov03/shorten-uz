CREATE TABLE "urls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"short_url" varchar(12) NOT NULL,
	"original_url" text NOT NULL,
	CONSTRAINT "urls_short_url_unique" UNIQUE("short_url")
);

CREATE INDEX "urls_user_id_idx" ON "urls" USING btree ("user_id");
