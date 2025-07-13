import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { db } from "~/server/db";
import { createImage } from "~/server/queries";
import { ratelimit } from "~/server/ratelimit";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    // Set permissions and file types for this FileRoute
    .input(z.object({ albumID: z.int().nullable().optional().default(null) }))
    .middleware(async ({ input }) => {
      const user = await auth();
      if (!user.userId) throw new UploadThingError("Unauthorized");

      const clerk = await clerkClient();
      const userInfo = await clerk.users.getUser(user.userId);
      if (userInfo?.privateMetadata?.["upload-perm"] !== true)
        throw new UploadThingError("No Upload Permission");

      const albumID = input.albumID ?? null;
      if (albumID != null) {
        const album = await db.query.albums.findFirst({
          where: (model, { eq }) => eq(model.id, albumID),
        });
        if (!album || album.userID !== user.userId)
          throw new UploadThingError("Album not found");
      }

      const { success } = await ratelimit.limit(user.userId);
      if (!success) throw new UploadThingError("Rate limited");

      // Accessible in onUploadComplete as `metadata`
      return { userId: user.userId, albumID };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(`Image Upload (${file.size}) complete for userId: ${metadata.userId}`);
      await createImage({
        name: file.name,
        key: file.key,
        url: file.ufsUrl,
        userID: metadata.userId,
        albumID: metadata.albumID
      });

      // Sent to the client side `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId, albumID: metadata.albumID };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
