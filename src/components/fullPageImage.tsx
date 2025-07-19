import { clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

import { deleteImage, getImage } from "~/server/queries";
import { Button } from "./ui/button";
import { ClientImageSync } from "./clientSync";

const day = 1000 * 60 * 60 * 24;

export default async function ImageModal({ id }: { id: number }) {
  const image = await getImage(id);
  if (!image) notFound();

  const clerk = await clerkClient();
  const uploader = await clerk.users.getUser(image.userID);

  const dateCreated = new Date(image.createdAt);
  const dateDiff = (new Date().getTime() - dateCreated.getTime()) / day;

  return (
    <div className="flex flex-col sm:flex-row w-full h-full justify-center">
      <ClientImageSync imageInfo={{ id: image.id, name: image.name, key: image.key, url: image.url, albumID: image.albumID }} />
      <div className="flex flex-shrink items-center justify-center">
        <img src={image.url} alt={image.name} className="flex-shrink max-h-full" />
      </div>
      <div className="flex flex-col flex-shrink-0 min-w-64 w-100 sm:w-64 bg-black/75 text-white border-x">
        <div className="text-lg border-b p-2 text-center">{image.name}</div>
        <div className="flex flex-col p-2">
          <span className="text-sm">Uploaded By</span>
          <span>{uploader.fullName}</span>
        </div>
        <div className="flex flex-col p-2">
          <span className="text-sm">Created</span>
          <span>
            {dateDiff > 1 ? dateCreated.toLocaleDateString() : dateCreated.toLocaleTimeString(
              undefined, {hour: "2-digit", minute: "2-digit"}
            )}
          </span>
        </div>
        <div className="p-2">
          <form action={async () => {
            "use server";
            await deleteImage(id);
            redirect("/");
          }}>
            <Button type="submit" variant="destructive">Delete</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
