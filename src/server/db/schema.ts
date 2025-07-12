import { sql, relations } from "drizzle-orm";
import { index, pgTableCreator, serial, timestamp, varchar, integer } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `theo_${name}`);

export const images = createTable(
  "image",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    key: varchar("key", { length: 256 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    userID: varchar("userID", { length: 128 }).notNull(),
    albumID: integer("albumID").default(sql`NULL`),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date()),
  },
  (image) => ([
    index("img_name_idx").on(image.name),
    index("img_album_idx").on(image.albumID)
  ])
);

export const albums = createTable(
  "album",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 256 }).notNull(),
    userID: varchar("userID", { length: 128 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .$onUpdate(() => new Date()),
  },
  (album) => ([
    index("album_name_idx").on(album.name)
  ])
);

export const albumsRelations = relations(albums, ({ many }) => ({
  images: many(images)
}));

export const imagesRelations = relations(images, ({ one }) => ({
  album: one(albums, {
    fields: [images.albumID],
    references: [albums.id]
  })
}));
