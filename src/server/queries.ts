import "server-only";

import { auth } from "@clerk/nextjs/server";
import { sql, and, eq, isNull } from "drizzle-orm";
import z from "zod";

import { db } from "~/server/db";
import { albums, images, lower, tableName } from "~/server/db/schema";
import analyticsServerClient from "~/server/analytics";
import { fileExtension, fileName } from "~/utils/file";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const AlbumNameSchema = z.string().trim().min(1).max(256);
export type AlbumName = z.infer<typeof AlbumNameSchema>;

export async function createAlbum(name: AlbumName) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const existingAlbum = await db.query.albums.findFirst({
    where: (model, { eq, and }) => and(
      eq(model.name, name),
      eq(model.userID, user.userId)
    ),
  });
  if (existingAlbum) { // Finds the smallest non-missing number for the name and appends it
    const escapedName = escapeRegex(name);
    const result = await db.execute(sql`
      WITH extracted_numbers AS (
        SELECT CAST(REGEXP_REPLACE(name, '^${sql.identifier(escapedName)} \\((\\d+)\\)$', '\\1') AS INTEGER) AS num
        FROM ${sql.identifier(tableName(albums._.name))}
        WHERE name ~ '^${sql.identifier(escapedName)} \\(\\d+\\)$'
      ),
      missing AS (
        SELECT generate_series(1, COALESCE((SELECT MAX(num) + 1 FROM extracted_numbers), 1)) AS n
      )
      SELECT n
      FROM missing
      WHERE n NOT IN (SELECT num FROM extracted_numbers)
      ORDER BY n
      LIMIT 1;
    `);
    const num = result.rows[0]!.n;
    name = `${name} (${num})`;
  }

  const createdAlbum = await db.insert(albums).values({
    name,
    userID: user.userId,
  }).returning({ id: albums.id });

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "create_album",
    properties: { albumId: createdAlbum[0]!.id }
  });

  return createdAlbum[0]!;
}

type TCreateImage = Pick<typeof images.$inferInsert, "name" | "key" | "url" | "userID" | "albumID">;

/**
 * Creates a new image in the database.
 *
 * NOTE: This function does not check if the user ID is valid or if the image exists in UploadThing.
 * Use responsibly!
 * @param values Values to insert into the images table.
 * @returns ID of the created image.
 */
export async function createImage(values: TCreateImage) {
  const existingImage = await db.query.images.findFirst({
    where: (model, { eq, and }) => and(
      eq(model.name, values.name),
      eq(model.userID, values.userID),
      values.albumID == null ? isNull(model.albumID) : eq(model.albumID, values.albumID)
    ),
  });
  if (existingImage) { // Finds the smallest non-missing number for the name and appends it
    const escapedName = escapeRegex(values.name);
    const result = await db.execute(sql`
      WITH extracted_numbers AS (
        SELECT CAST(REGEXP_REPLACE(name, '^${sql.identifier(escapedName)} \\((\\d+)\\)$', '\\1') AS INTEGER) AS num
        FROM ${sql.identifier(tableName(images._.name))}
        WHERE name ~ '^${sql.identifier(escapedName)} \\(\\d+\\)$'
      ),
      missing AS (
        SELECT generate_series(1, COALESCE((SELECT MAX(num) + 1 FROM extracted_numbers), 1)) AS n
      )
      SELECT n
      FROM missing
      WHERE n NOT IN (SELECT num FROM extracted_numbers)
      ORDER BY n
      LIMIT 1;
    `);
    const num = result.rows[0]!.n;
    values.name = `${fileName(values.name)} (${num}).${fileExtension(values.name)}`;
  }

  const createdImage = await db.insert(images).values(values).returning({ id: images.id });

  analyticsServerClient.capture({
    distinctId: values.userID,
    event: "create_image",
    properties: { imageId: createdImage[0]!.id }
  });

  return createdImage[0]!;
}

export async function getMyAlbums() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const albums = await db.query.albums.findMany({
    where: (model, { eq }) => eq(model.userID, user.userId),
    orderBy: (model, { asc }) => asc(lower(model.name)),
  });
  return albums;
}

export async function getMyImages() {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const images = await db.query.images.findMany({
    where: (model, { eq, and, isNull }) => and(isNull(model.albumID), eq(model.userID, user.userId)),
    orderBy: (model, { asc }) => asc(lower(model.name)),
  });
  return images;
}

export async function getAlbumImages(albumID: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const images = await db.query.images.findMany({
    where: (model, { eq, and }) => and(eq(model.albumID, albumID), eq(model.userID, user.userId)),
    orderBy: (model, { asc }) => asc(lower(model.name)),
  });
  return images;
}

export async function getImage(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const image = await db.query.images.findFirst({
    where: (model, { eq, and }) => and(eq(model.userID, user.userId), eq(model.id, id)),
  });
  if (!image) throw new Error("Not Found");

  return image;
}

export async function updateAlbum(id: number, options: { name: AlbumName }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const existingAlbum = await db.query.albums.findFirst({
    where: (model, { eq, and }) => and(eq(model.name, options.name), eq(model.userID, user.userId)),
  });
  if (existingAlbum) throw new Error("Album already exists");

  const updatedAlbum = await db.update(albums).set({ name: options.name }).where(
    and(eq(albums.id, id), eq(albums.userID, user.userId))
  ).returning({ name: albums.name });

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "update_album",
    properties: { albumId: id }
  });

  return updatedAlbum[0]!;
}

const ImageUpdateSchema = z.strictObject({
  name: z.string().trim().min(1).max(256),
  albumID: z.int().nullable(),
}).partial().refine((data) => Object.values(data).some((v) => v !== undefined), {
  message: "At least one field must be provided",
}).brand("ImageUpdateSchema");
export type ImageUpdate = z.infer<typeof ImageUpdateSchema>;

export async function updateImage(id: number, options: ImageUpdate) {
  const image = await getImage(id);
  options.name ??= image.name;
  options.albumID ??= image.albumID;

  const existingImage = await db.query.images.findFirst({
    where: (model, { eq, and }) => and(
      eq(model.name, options.name!),
      options.albumID == null ? isNull(model.albumID) : eq(model.albumID, options.albumID)
    ),
  });
  if (existingImage) throw new Error("Image already exists");

  const updatedImage = await db.update(images).set({
    name: options.name, albumID: options.albumID
  }).where(eq(images.id, id)).returning({
    name: images.name, albumID: images.albumID
  });
  // TODO: Update UploadThing as well

  analyticsServerClient.capture({
    distinctId: image.userID,
    event: "update_image",
    properties: { imageId: id }
  });

  return updatedImage[0]!;
}

export async function deleteAlbum(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  await db.delete(albums).where(
    and(eq(albums.id, id), eq(albums.userID, user.userId))
  );
  await db.delete(images).where(
    and(eq(images.albumID, id), eq(images.userID, user.userId))
  );
  // TODO: Delete from UploadThing as well

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "delete_album",
    properties: { albumId: id }
  });
}

// BUG: Client sends the form POST (causing getImage to throw Error) after being redirected (GET)
export async function deleteImage(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  await db.delete(images).where(
    and(eq(images.id, id), eq(images.userID, user.userId))
  );
  // TODO: Delete from UploadThing as well

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "delete_image",
    properties: { imageId: id }
  });
}
