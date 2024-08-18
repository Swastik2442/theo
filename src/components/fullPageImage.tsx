import { getImage } from "~/server/queries";

export default async function ImageModal({ id } : { id : number }) {
    const image = await getImage(id);
    return (
        <img src={image.url} width={256} height={256} alt={image.name}/>
    )
}
