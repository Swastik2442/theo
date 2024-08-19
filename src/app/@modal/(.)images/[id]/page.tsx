import { Modal } from "./modal";
import FullPageImage from "~/components/fullPageImage";

export default function ImageModal(
  { params: { id: photoID } }: { params: { id: string } }
) {
  const idAsNumber = Number(photoID);
  if (isNaN(idAsNumber)) throw new Error("Invalid ID");

  return (
    <Modal>
      <FullPageImage id={idAsNumber} />
    </Modal>
  )
}
