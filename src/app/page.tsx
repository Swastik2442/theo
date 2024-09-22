import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { getMyImages } from "~/server/queries";

// Does not Cache the Page
export const dynamic = "force-dynamic";

/*
  TODO: Remove File Extension from Image Name and Add to Details
  TODO: Add "Selecting Images" for Mass Action (zustand?)
  TODO: Pagination or Infinite Scroll
*/
async function Images() {
  const images = await getMyImages();
  return (
    <div className="p-4 flex flex-wrap gap-4 items-center justify-center">
      {images.map((image) => (
        <div key={image.id} className="w-48 flex flex-col">
          <Link href={`/images/${image.id}`}>
            <Image src={image.url} alt={image.name} width={192} height={192} className="aspect-square object-contain" />
          </Link>
          <div className="max-w-48 text-center pt-1">{image.name}</div>
        </div>
      ))}
    </div>
  )
}

function SignInPrompt() {
  return (
    <div className="h-full w-full p-4 text-2xl text-center">
      Sign in to see Images
    </div>
  )
}

export default function HomePage() {
  return (
    <>
      <SignedIn><Images /></SignedIn>
      <SignedOut><SignInPrompt /></SignedOut>
    </>
  );
}
