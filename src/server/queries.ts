import "server-only";

import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";

import { db } from "~/server/db";
import { images } from "./db/schema";
import analyticsServerClient from "./analytics";

export async function getMyImages() {
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");

  const images = await db.query.images.findMany({
    where: (model, { eq }) => eq(model.userID, user.userId),
    orderBy: (model, { desc }) => desc(model.id),
  });
  return images;
}

export async function getImage(id: number) {
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");

  const image = await db.query.images.findFirst({
    where: (model, { eq, and }) => and(eq(model.userID, user.userId), eq(model.id, id)),
  });
  if (!image) throw new Error("Not Found");

  return image;
}

// BUG: Client sends the form POST (causing getImage to throw Error) after being redirected (GET)
export async function deleteImage(id: number) {
  const user = auth();
  if (!user.userId) throw new Error("Unauthorized");

  await db.delete(images).where(
    and(eq(images.id, id), eq(images.userID, user.userId))
  );

  analyticsServerClient.capture({
    distinctId: user.userId,
    event: "delete_image",
    properties: {
      imageId: id,
    },
  });

  redirect("/");
}
