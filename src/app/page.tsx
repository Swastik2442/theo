import { SignedIn, SignedOut } from "@clerk/nextjs";

import { getMyAlbums, getMyImages } from "~/server/queries";
import { AlbumsAndImagesGrid } from "~/components/grids";

// Does not Cache the Page
export const dynamic = "force-dynamic";

/*
  TODO: Add "Selecting Images" for Mass Action (zustand?)
  TODO: Pagination or Infinite Scroll
*/
async function AlbumsAndImages() {
  const albums = await getMyAlbums();
  const images = await getMyImages();
  return <AlbumsAndImagesGrid albums={albums} images={images} />;
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
      <SignedIn><AlbumsAndImages /></SignedIn>
      <SignedOut><SignInPrompt /></SignedOut>
    </>
  );
}
