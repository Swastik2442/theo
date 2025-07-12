CREATE TABLE "theo_image" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(256) NOT NULL,
	"key" varchar(256) NOT NULL,
	"url" varchar(1024) NOT NULL,
	"userID" varchar(128) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "name_idx" ON "theo_image" USING btree ("name");