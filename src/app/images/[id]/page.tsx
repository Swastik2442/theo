import FullPageImage from "~/components/fullPageImage";

export default async function Image(
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const idAsNumber = Number(id);
    if (isNaN(idAsNumber)) throw new Error("Invalid ID");

    return <FullPageImage id={idAsNumber} />
}
