import { notFound } from 'next/navigation';
import { ClientAlbumSync } from '~/components/clientSync';
import { AlbumsAndImagesGrid } from "~/components/grids";

import { getAlbum, getAlbumImages } from "~/server/queries";

// Does not Cache the Page
export const dynamic = "force-dynamic";

export default async function Album(
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idAsNumber = Number(id);
  if (isNaN(idAsNumber)) throw new Error("Invalid ID");

  const album = await getAlbum(idAsNumber);
  if (!album) notFound();
  const images = await getAlbumImages(idAsNumber);

  return (
    <>
      <ClientAlbumSync
        albumInfo={{ id: album.id, name: album.name }}
        images={images.map(img => ({ id: img.id, name: img.name, key: img.key, url: img.url, albumID: img.albumID }))}
      />
      <AlbumsAndImagesGrid albums={[]} images={images} />
    </>
  );
}
