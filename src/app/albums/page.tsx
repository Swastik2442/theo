import { getMyAlbums } from "~/server/queries";
import { AlbumsAndImagesGrid } from "~/components/grids";

// Does not Cache the Page
export const dynamic = "force-dynamic";

export async function Albums() {
  const albums = await getMyAlbums();
  return <AlbumsAndImagesGrid albums={albums} images={[]} />;
}
