import Image from "next/image";
import Link from "next/link";

import { albums, images } from "~/server/db/schema"
import { gradientFromString } from "~/utils/color";
import { fileName } from "~/utils/file";

type TAlbum = Pick<typeof albums.$inferSelect, "id" | "name">;
type TImage = Pick<typeof images.$inferSelect, "id" | "url" | "name">;

function CustomGrid({ items }: { items: { key: React.Key; component: React.ReactNode; }[] }) {
  return (
    <div className="p-4 flex flex-wrap gap-4 items-center justify-center">
      {items.map((item) => (
        <div key={item.key} className="w-48 flex flex-col">
          {item.component}
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
          className="max-w-48 text-center -rotate-45 text-white truncate select-none"
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
      <p className="max-w-48 text-center pt-1 truncate" title={image.name}>{fileName(image.name)}</p>
    </Link>
  );
}

export async function AlbumsAndImagesGrid({ albums, images }: { albums: TAlbum[]; images: TImage[] }) {
  return (
    <CustomGrid items={[
      ...albums.map((album) => ({
        key: `album-${album.id}`,
        component: <AlbumCard album={album} />
      })),
      ...images.map((image) => ({
        key: `image-${image.id}`,
        component: <ImageCard image={image} />
      })),
    ]} />
  );
}
