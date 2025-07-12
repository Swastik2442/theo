CREATE TABLE "theo_album" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"userID" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
DROP INDEX "name_idx";--> statement-breakpoint
ALTER TABLE "theo_image" ADD COLUMN "albumID" integer DEFAULT NULL;--> statement-breakpoint
CREATE INDEX "album_name_idx" ON "theo_album" USING btree ("name");--> statement-breakpoint
CREATE INDEX "img_name_idx" ON "theo_image" USING btree ("name");--> statement-breakpoint
CREATE INDEX "img_album_idx" ON "theo_image" USING btree ("albumID");