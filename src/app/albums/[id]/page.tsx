import { notFound } from 'next/navigation';
import { ClientAlbumSync } from '~/components/clientSync';
import { ImagesGrid } from "~/components/grids";

import { getAlbum, getAlbumImages } from "~/server/queries";

// Does not Cache the Page
export const dynamic = "force-dynamic";

export default async function Album(
  { params: { id: albumID } }: { params: { id: string } }
) {
  const idAsNumber = Number(albumID);
  if (isNaN(idAsNumber)) throw new Error("Invalid ID");

  const album = await getAlbum(idAsNumber);
  if (!album) notFound();
  const images = await getAlbumImages(idAsNumber);

  return (
    <>
      <ClientAlbumSync albumInfo={{ id: album.id, name: album.name }} />
      <ImagesGrid images={images} />
    </>
  );
}
