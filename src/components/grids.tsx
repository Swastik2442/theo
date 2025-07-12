import Image from "next/image";
import Link from "next/link";

import { albums, images } from "~/server/db/schema"
import { gradientFromString } from "~/utils/color";
import { removedExtension } from "~/utils/file";

type TAlbum = Pick<typeof albums.$inferSelect, "id" | "name">;
type TImage = Pick<typeof images.$inferSelect, "id" | "url" | "name">;

function CustomGrid({ items }: { items: React.ReactNode[] }) {
  return (
    <div className="p-4 flex flex-wrap gap-4 items-center justify-center">
      {items.map((item, idx) => (
        <div key={idx} className="w-48 flex flex-col">
          {item}
        </div>
      ))}
    </div>
  )
}

function AlbumCard({ album }: { album: TAlbum }) {
  return (
    <Link href={`/albums/${album.id}`}>
      <div
        className="size-48 border rounded-md border-accent hover:border-accent-foreground flex items-center justify-center"
        style={{ backgroundImage: gradientFromString(`album-${album.id}`) }}
      >
        <p
          className="max-w-48 text-center -rotate-45 text-white truncate"
          style={{ textShadow: "1.5px 1.5px 1px black" }}
          title={album.name}
        >{album.name}</p>
      </div>
      <p className="max-w-48 text-center pt-1 truncate" title={album.name}>{album.name}</p>
    </Link>
  );
}

function ImageCard({ image }: { image: TImage }) {
  return (
    <Link href={`/images/${image.id}`}>
      <Image
        src={image.url} alt={image.name} title={image.name}
        width={192} height={192}
        className="aspect-square object-contain border rounded-md border-accent hover:border-accent-foreground"
      />
      <p className="max-w-48 text-center pt-1 truncate" title={image.name}>{removedExtension(image.name)}</p>
    </Link>
  );
}

export async function AlbumsAndImagesGrid({ albums, images }: { albums: TAlbum[]; images: TImage[] }) {
  return (
    <CustomGrid items={[
      ...albums.map((album) => (
        <AlbumCard key={`album-${album.id}`} album={album} />
      )),
      ...images.map((image) => (
        <ImageCard key={`image-${image.id}`} image={image} />
      )),
    ]} />
  );
}

export async function ImagesGrid({ images }: { images: TImage[] }) {
  return (
    <CustomGrid items={images.map((image) => (
      <ImageCard key={`image-${image.id}`} image={image} />
    ))} />
  )
}
