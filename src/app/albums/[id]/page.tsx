import { notFound } from 'next/navigation';
import ImagesGrid from "~/components/imagesGrid";

import { getAlbumImages } from "~/server/queries";

// Does not Cache the Page
export const dynamic = "force-dynamic";

export default async function Album(
    { params: { id: albumID } }: { params: { id: string } }
) {
    const idAsNumber = Number(albumID);
    if (isNaN(idAsNumber)) throw new Error("Invalid ID");

    const images = await getAlbumImages(idAsNumber);
    if (!images) notFound();

    return <ImagesGrid images={images} />;
}
