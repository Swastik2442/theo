import { SignedIn, SignedOut } from "@clerk/nextjs";

import { getMyAlbums, getMyImages } from "~/server/queries";
import { AlbumsAndImagesGrid } from "~/components/grids";
import { ClientAlbumsAndImagesSync } from "~/components/clientSync";

// Does not Cache the Page
export const dynamic = "force-dynamic";

/*
  TODO: Add "Selecting Images" for Mass Action (zustand?)
  TODO: Pagination or Infinite Scroll
*/
async function AlbumsAndImages() {
  const albums = await getMyAlbums();
  const images = await getMyImages();
  return (
    <>
      <ClientAlbumsAndImagesSync albums={albums} images={images} />
      <AlbumsAndImagesGrid albums={albums} images={images} />
    </>
  );
}

function SignInPrompt() {
  return (
    <p className='p-4 text-2xl text-center'>Sign in to see Images</p>
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
