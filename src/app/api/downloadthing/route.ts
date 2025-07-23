import { NextRequest } from "next/server";
import archiver from "archiver";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import z from "zod";

import { db } from "~/server/db";

const RequestBodySchema = z.object({
  albums: z.array(z.int().nonnegative()).default([]),
  images: z.array(z.int().nonnegative()).default([])
}).refine(({ albums, images }) => albums.length > 0 || images.length > 0);

export async function POST(req: NextRequest) {
  const user = await auth();
  if (!user.userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Parse the Request Body
  const parsedBody = RequestBodySchema.safeParse(await req.json());
  if (!parsedBody.success) {
    return new Response("Invalid request body", { status: 400 });
  }
  const { albums, images } = parsedBody.data;

  // Get the requested Images
  const selectedImages = await db.query.images.findMany({
    where: (model, { eq, inArray, and }) => and(
      inArray(model.id, images),
      eq(model.userID, user.userId)
    )
  });
  if (selectedImages.length !== images.length) {
    return new Response("Invalid request body", { status: 400 });
  }

  // Get the requested Albums
  const selectedAlbums = await db.query.albums.findMany({
    where: (model, { eq, inArray, and }) => and(
      inArray(model.id, albums),
      eq(model.userID, user.userId)
    )
  });
  if (selectedAlbums.length !== albums.length) {
    return new Response("Invalid request body", { status: 400 });
  }

  const archive = archiver("zip");
  // archive.pipe(res);

  await Promise.all([
    // For each image, fetch it & append its stream directly
    await Promise.all(selectedImages.map(async (image) => {
      const remoteRes = await fetch(image.url);
      const options: archiver.ZipEntryData = { name: image.name, date: image.updatedAt ?? image.createdAt };

      if (!remoteRes.ok) {
        console.warn(`Failed to fetch ${image.url}`);
        archive.append('', options);
        return;
      }

      // Append the converted Node Readable stream into the ZIP
      // @ts-expect-error extends the same interface
      archive.append(Readable.fromWeb(remoteRes.body!), options);
    })),

    // For each album, fetch its images & append their stream directly
    await Promise.all(selectedAlbums.map(async (album) => {
      const albumImages = await db.query.images.findMany({
        where: (model, { eq, and }) => and(
          eq(model.albumID, album.id),
          eq(model.userID, user.userId)
        )
      });
      await Promise.all(albumImages.map(async (albumImage) => {
        const remoteRes = await fetch(albumImage.url);
        const options: archiver.ZipEntryData = {
          name: `${album.name}/${albumImage.name}`,
          date: albumImage.updatedAt ?? albumImage.createdAt
        };

        if (!remoteRes.ok) {
          console.warn(`Failed to fetch ${albumImage.url}`);
          archive.append('', options);
          return;
        }

        // Append the converted Node Readable stream into the ZIP
        // @ts-expect-error extends the same interface
        archive.append(Readable.fromWeb(remoteRes.body!), options);
      }));
    }))
  ]);

  // finalize means no more files will be added
  archive.finalize();

  // Return it as a streaming Response
  // @ts-expect-error extends the same interface
  return new Response(Readable.toWeb(archive), {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=download.zip"
    }
  });
};
