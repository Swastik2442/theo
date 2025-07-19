import { getMyAlbums, getMyImages } from "~/server/queries";
import { AlbumsAndImagesGrid } from "~/components/grids";
import { ClientAlbumsAndImagesSync } from "~/components/clientSync";

// Does not Cache the Page
export const dynamic = "force-dynamic";

/*
  TODO: Add "Selecting Images" for Mass Action (zustand?)
  TODO: Pagination or Infinite Scroll
*/
export default async function HomePage() {
  const albums = await getMyAlbums();
  const images = await getMyImages();
  return (
    <>
      <ClientAlbumsAndImagesSync
        albums={albums.map(album => ({ id: album.id, name: album.name }))}
        images={images.map(img => ({ id: img.id, name: img.name, key: img.key, url: img.url, albumID: img.albumID }))}
      />
      <AlbumsAndImagesGrid albums={albums} images={images} />
    </>
  );
}
