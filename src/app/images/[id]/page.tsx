export default function ImageModal(
    { params: { id: photoID } }: { params: { id: string } }
) {
    return (
        <div className="text-red">{photoID}</div>   
    )
}
