import { NextRequest } from "next/server";
import archiver from "archiver";
import { Readable } from "stream";
import { auth } from "@clerk/nextjs/server";
import z from "zod";

import { db } from "~/server/db";

/** Convert Web ReadableStream to Node.js Readable stream */
function webStreamToNodeStream<T>(webStream: ReadableStream<T>) {
  const reader = webStream.getReader();
  return Readable.from((async function* () {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  })());
}

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
    return new Response(`Invalid request body - ${JSON.stringify((parsedBody.error))}`, { status: 400 });
  }
  const { albums, images } = parsedBody.data;

  // Get the requested Images
  const selectedImages = await db.query.images.findMany({
    where: (model, { eq, inArray, and }) => and(
      inArray(model.id, images),
      eq(model.userID, user.userId)
    )
  });
  if (selectedImages.length != images.length) {
    return new Response("Invalid request body - images length notequal", { status: 400 });
  }

  // Get the requested Albums
  const selectedAlbums = await db.query.albums.findMany({
    where: (model, { eq, inArray, and }) => and(
      inArray(model.id, albums),
      eq(model.userID, user.userId)
    )
  });
  if (selectedAlbums.length != albums.length) {
    return new Response("Invalid request body - albums length notequal", { status: 400 });
  }

  const archive = archiver("zip");
  // archive.pipe(res);

  // For each image, fetch it & append its stream directly
  for (const image of selectedImages) {
    console.log(`Fetching ${image.url}`);
    const remoteRes = await fetch(image.url);

    if (!remoteRes.ok) {
      console.warn(`Failed to fetch ${image.url}`);
      continue;
    }

    // Append the converted Node Readable stream into the ZIP
    archive.append(
      webStreamToNodeStream(remoteRes.body!),
      { name: image.name, date: image.updatedAt ?? image.createdAt }
    );
  }

  // For each album, fetch its images & append their stream directly
  for (const album of selectedAlbums) {
    const albumImages = await db.query.images.findMany({
      where: (model, { eq, and }) => and(
        eq(model.albumID, album.id),
        eq(model.userID, user.userId)
      )
    });

    for (const albumImage of albumImages) {
      console.log(`Fetching ${albumImage.url}`);
      const remoteRes = await fetch(albumImage.url);

      if (!remoteRes.ok) {
        console.warn(`Failed to fetch ${albumImage.url}`);
        continue;
      }

      // Append the converted Node Readable stream into the ZIP
      archive.append(
        webStreamToNodeStream(remoteRes.body!),
        { name: `${album.name}/${albumImage.name}`, date: albumImage.updatedAt ?? albumImage.createdAt }
      );
    }
  }

  // finalize means no more files will be added
  archive.finalize();

  // Convert Node Readable -> Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      archive.on("data", (chunk: Buffer) => {
        controller.enqueue(chunk);
      });
      archive.on("end", () => {
        controller.close();
      });
      archive.on("error", (err: Error) => {
        controller.error(err);
      });
    }
  });

  // Return it as a streaming Response
  return new Response(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": "attachment; filename=download.zip"
    }
  });
};
