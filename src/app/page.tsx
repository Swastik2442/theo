import { db } from "~/server/db";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export const dynamic = "force-dynamic"; // Does not Cache the Page

async function Images() {
  const images = await db.query.images.findMany({
    orderBy: (model, { desc }) => desc(model.id),
  });
  return (
    <div className="flex flex-wrap gap-4">
      {images.map((image) => (
        <div key={image.id} className="w-48 flex flex-col">
          <img src={image.url} />
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
