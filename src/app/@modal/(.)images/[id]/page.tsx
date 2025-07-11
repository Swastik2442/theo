import { Modal } from "./modal";
import FullPageImage from "~/components/fullPageImage";

export default async function ImageModal({ params }: { params: Promise<{ id: string }> }) {
  const { id: photoID } = await params;
  const idAsNumber = Number(photoID);
  if (isNaN(idAsNumber)) throw new Error("Invalid ID");

  return (
    <Modal>
      <FullPageImage id={idAsNumber} />
    </Modal>
  )
}
