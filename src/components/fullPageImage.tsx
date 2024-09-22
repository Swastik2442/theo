import { clerkClient } from "@clerk/nextjs/server";

import { deleteImage, getImage } from "~/server/queries";
import { Button } from "./ui/button";

const day = 1000 * 60 * 60 * 24;

export default async function ImageModal({ id }: { id: number }) {
  const image = await getImage(id);
  const uploader = await clerkClient().users.getUser(image.userID);

  const dateCreated = new Date(image.createdAt);
  const dateDiff = (new Date().getTime() - dateCreated.getTime()) / day;

  return (
    <div className="flex flex-col sm:flex-row w-full h-full justify-center">
      <div className="flex flex-shrink items-center justify-center">
        <img src={image.url} className="flex-shrink max-h-full" alt={image.name} />
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
          }}>
            <Button type="submit" variant="destructive">Delete</Button>
          </form>
        </div>
      </div>
    </div>
  )
}
