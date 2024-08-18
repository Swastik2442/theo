import Image from "next/image";

import { getImage } from "~/server/queries";

export default async function ImageModal(
    { params: { id: photoID } }: { params: { id: string } }
) {
    const idAsNumber = Number(photoID);
    if (isNaN(idAsNumber)) throw new Error("Invalid ID");

    const image = await getImage(idAsNumber);
    return (
        <div>
            <Image src={image.url} width={128} height={128} alt={image.name}/>
        </div>
    )
}
