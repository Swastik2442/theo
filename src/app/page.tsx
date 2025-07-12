import { SignedIn, SignedOut } from "@clerk/nextjs";

import { getMyImages } from "~/server/queries";
import ImagesGrid from "~/components/imagesGrid";

// Does not Cache the Page
export const dynamic = "force-dynamic";

/*
  TODO: Add "Selecting Images" for Mass Action (zustand?)
  TODO: Pagination or Infinite Scroll
*/
async function Images() {
  const images = await getMyImages();
  return <ImagesGrid images={images} />;
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
