import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";

import { getMyImages } from "~/server/queries";

export const dynamic = "force-dynamic"; // Does not Cache the Page

async function Images() {
  const images = await getMyImages();
  return (
    <div className="px-4 flex flex-wrap gap-4">
      {images.map((image) => (
        <div key={image.id} className="w-48 flex flex-col">
          <Link href={`/images/${image.id}`}>
            <Image src={image.url} alt={image.name} width={192} height={192} />
          </Link>
          <div>{image.name}</div>
        </div>
      ))}
    </div>
  )
}

export default function HomePage() {
  return (
    <main>
      <SignedIn><Images /></SignedIn>
      <SignedOut>
        <div className="h-full w-full text-2xl text-center">
          Sign in to see Images
        </div>
      </SignedOut>
    </main>
  );
}
