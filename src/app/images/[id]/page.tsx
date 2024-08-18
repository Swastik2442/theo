import FullPageImage from "~/components/fullPageImage";

export default function Image(
    { params: { id: photoID } }: { params: { id: string } }
) {
    const idAsNumber = Number(photoID);
    if (isNaN(idAsNumber)) throw new Error("Invalid ID");

    return <FullPageImage id={idAsNumber} />
}
