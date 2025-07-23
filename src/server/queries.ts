import "server-only";

import { auth } from "@clerk/nextjs/server";
import { sql, and, eq, isNull, inArray } from "drizzle-orm";
import z from "zod";
import isValidFilename from 'valid-filename';

import { db } from "~/server/db";
import { albums, images, lower, tableName } from "~/server/db/schema";
import utClient from "~/server/uploadthing";
import analyticsServerClient from "~/server/analytics";
import { fileExtension, fileName } from "~/utils/file";

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const AlbumNameSchema = z.string().trim().min(1).max(192).refine(isValidFilename);
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

  const [createdAlbum] = await db.insert(albums).values({
    name,
    userID: user.userId,
  }).returning({ id: albums.id });

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "create_album",
    properties: { albumId: createdAlbum!.id }
  });

  return createdAlbum!;
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
    const ext = fileExtension(values.name);
    values.name = `${fileName(values.name)} (${num})${ext.length > 0 ? ext : ""}`;
  }

  const [createdImage] = await db.insert(images).values(values).returning({ id: images.id });

  analyticsServerClient.capture({
    distinctId: values.userID,
    event: "create_image",
    properties: { imageId: createdImage!.id }
  });

  return createdImage!;
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

export async function getAlbum(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const album = await db.query.albums.findFirst({
    where: (model, { eq, and }) => and(eq(model.userID, user.userId), eq(model.id, id)),
  });
  if (!album) return null;

  return album;
}

export async function getImage(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const image = await db.query.images.findFirst({
    where: (model, { eq, and }) => and(eq(model.userID, user.userId), eq(model.id, id)),
  });
  if (!image) return null;

  return image;
}

export async function updateAlbum(id: number, options: { name: AlbumName }) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const existingAlbum = await db.query.albums.findFirst({
    where: (model, { eq, and }) => and(eq(model.name, options.name), eq(model.userID, user.userId)),
  });
  if (existingAlbum) throw new Error("Album already exists");

  const [updatedAlbum] = await db.update(albums).set({ name: options.name }).where(
    and(eq(albums.id, id), eq(albums.userID, user.userId))
  ).returning({ name: albums.name });

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "update_album",
    properties: { albumId: id }
  });

  return updatedAlbum!;
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
  if (!image) throw new Error("Image not found");

  options.name ??= image.name;
  options.albumID ??= image.albumID;

  const existingImage = await db.query.images.findFirst({
    where: (model, { eq, and }) => and(
      eq(model.name, options.name!),
      options.albumID == null ? isNull(model.albumID) : eq(model.albumID, options.albumID)
    ),
  });
  if (existingImage) throw new Error("Image already exists");

  const updatedImage = await db.transaction(async (tx) => {
    try {
      const result = await utClient.renameFiles({
        fileKey: image.key,
        newName: options.name!
      });
      if (!result.success) {
        throw new Error("Renaming file in UploadThing Unsuccessful");
      }
    } catch (error) {
      console.error("Failed to rename file in UploadThing:", error);
      tx.rollback();
    }

    const [updatedImage] = await tx.update(images).set({
      name: options.name!, albumID: options.albumID
    }).where(eq(images.id, id)).returning({
      name: images.name, albumID: images.albumID
    });
    return updatedImage!;
  });

  analyticsServerClient.capture({
    distinctId: image.userID,
    event: "update_image",
    properties: { imageId: id }
  });

  return updatedImage;
}

export async function moveImageToAlbum(imageId: number, albumId: Nullable<number>) {
  const image = await getImage(imageId);
  if (!image) throw new Error("Image not found");

  if (albumId !== null) {
    const album = await getAlbum(albumId);
    if (!album) throw new Error("Album not found");
  }

  await db.update(images).set({ albumID: albumId }).where(
    and(eq(images.id, imageId), eq(images.userID, image.userID))
  );

  analyticsServerClient.capture({
    distinctId: image.userID,
    event: "move_image",
    properties: { imageId, albumId }
  });
}

export async function moveImagesToAlbum(imageIds: number[], albumId: Nullable<number>) {
  if (imageIds.length === 0) throw new Error("No image IDs provided");

  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  if (albumId !== null) {
    const album = await getAlbum(albumId);
    if (!album) throw new Error("Album not found");
  }

  const err = await db.transaction(async (tx) => {
    const [check] = await tx
      .select({ count: sql<string>`count(*)` }).from(images)
      .where(and(inArray(images.id, imageIds), eq(images.userID, user.userId)));
    if (Number(check!.count) !== imageIds.length) {
      tx.rollback();
      return new Error("Images not found");
    }

    await tx.update(images).set({ albumID: albumId }).where(
      and(inArray(images.id, imageIds), eq(images.userID, user.userId))
    );
  });
  if (err) throw err;

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "move_images",
    properties: { imageIds, albumId }
  });
}

export async function deleteAlbum(id: number) {
  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const albumImages = await getAlbumImages(id);
  const albumImagesKeys = albumImages.map(img => img.key);

  await db.transaction(async (tx) => {
    if (albumImagesKeys.length > 0) {
      try {
        const result = await utClient.deleteFiles(albumImagesKeys);
        if (!result.success || result.deletedCount != albumImagesKeys.length) {
          throw new Error("Deleting files in UploadThing Unsuccessful");
        } // Can be improved to handle partial deletions
      } catch (error) {
        console.error("Failed to delete files in UploadThing:", error);
        tx.rollback();
      }

      await tx.delete(images).where(
        and(eq(images.albumID, id), eq(images.userID, user.userId))
      );
    }

    await tx.delete(albums).where(
      and(eq(albums.id, id), eq(albums.userID, user.userId))
    );
  });

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "delete_album",
    properties: { albumId: id }
  });
}

// BUG: Client sends the form POST (causing getImage to throw Error) after being redirected (GET)
export async function deleteImage(id: number) {
  const image = await getImage(id);
  if (!image) throw new Error("Image not found");

  await db.transaction(async (tx) => {
    try {
      const result = await utClient.deleteFiles(image.key);
      if (!result.success || result.deletedCount != 1) {
        throw new Error("Deleting file in UploadThing Unsuccessful");
      }
    } catch (error) {
      console.error("Failed to delete file in UploadThing:", error);
      tx.rollback();
    }

    await tx.delete(images).where(eq(images.id, id));
  });

  analyticsServerClient.capture({
    distinctId: image.userID,
    event: "delete_image",
    properties: { imageId: id }
  });
}

export async function deleteMultiple(imageIds: number[], albumIds: number[]) {
  if (imageIds.length === 0 && albumIds.length === 0) {
    throw new Error("No image or album IDs provided");
  }

  const user = await auth();
  if (!user.userId) throw new Error("Unauthorized");

  const err = await db.transaction(async (tx) => {
    if (albumIds.length > 0) {
      const [check2] = await tx
        .select({ count: sql<string>`count(*)` }).from(albums)
        .where(and(inArray(albums.id, albumIds), eq(albums.userID, user.userId)));
      if (Number(check2!.count) !== albumIds.length) {
        tx.rollback();
        return new Error("Albums not found");
      }

      await tx.delete(albums).where(
        and(inArray(albums.id, albumIds), eq(albums.userID, user.userId))
      );
      await tx.delete(images).where(
        and(inArray(images.albumID, albumIds), eq(images.userID, user.userId))
      );
    }

    if (imageIds.length > 0) {
      const [check1] = await tx
        .select({ count: sql<string>`count(*)` }).from(images)
        .where(and(inArray(images.id, imageIds), eq(images.userID, user.userId)));
      if (Number(check1!.count) !== imageIds.length) {
        tx.rollback();
        return new Error("Images not found");
      }

      await tx.delete(images).where(
        and(inArray(images.id, imageIds), eq(images.userID, user.userId))
      );
    }
  });
  if (err) throw err;

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "delete_multiple",
    properties: { imageIds, albumIds }
  });
}
