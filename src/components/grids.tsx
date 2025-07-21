import Image from "next/image";
import { Check } from "lucide-react";

import { albums, images } from "~/server/db/schema"
import { AlbumCardContainer, GridSelectionContainer, GridSelectionShortcuts, ImageCardContainer } from "~/components/containers";
import { gradientFromString } from "~/utils/color";
import { fileName } from "~/utils/file";
import { cn } from "~/utils/css";

type TAlbum = Pick<typeof albums.$inferSelect, "id" | "name">;
type TImage = Pick<typeof images.$inferSelect, "id" | "url" | "name">;

function CustomGrid({ items }: { items: { key: React.Key; component: React.ReactNode; }[] }) {
  return (
    <div className="p-4 flex flex-wrap gap-4 items-center justify-center select-none">
      {items.map((item) => (
        <div key={item.key} className="w-48 flex flex-col">
          {item.component}
        </div>
      ))}
    </div>
  )
}

const selectedContainerStyles = "outline-1 rounded-md outline-accent hover:outline-accent-foreground group-data-[selected=true]:outline-accent-foreground group-data-[selected=true]:outline-2 group-data-[selected=true]:hover:outline-3";
function SelectedCheck() {
  return (
    <div className="bg-blue-500 text-white shadow-md rounded-md absolute bottom-1.5 right-1.5 group-data-[selected=true]:block hidden">
      <Check/>
    </div>
  );
}

function AlbumCard({ album }: { album: TAlbum }) {
  return (
    <AlbumCardContainer album={album}>
      <div
        className={cn("size-48 flex items-center justify-center relative", selectedContainerStyles)}
        style={{ backgroundImage: gradientFromString(`album-${album.id}`) }}
      >
        <p
          className="max-w-48 text-center -rotate-45 text-white truncate select-none"
          style={{ textShadow: "1.5px 1.5px 1px black" }}
          title={album.name}
        >{album.name}</p>
        <SelectedCheck />
      </div>
      <p className="max-w-48 text-center pt-1 truncate" title={album.name}>{album.name}</p>
    </AlbumCardContainer>
  );
}

function ImageCard({ image }: { image: TImage }) {
  return (
    <ImageCardContainer image={image}>
      <div className="relative">
        <Image
          src={image.url} alt={image.name} title={image.name}
          width={192} height={192}
          className={cn("aspect-square object-contain", selectedContainerStyles)}
        />
        <SelectedCheck />
      </div>
      <p className="max-w-48 text-center pt-1 truncate" title={image.name}>{fileName(image.name)}</p>
    </ImageCardContainer>
  );
}

export async function AlbumsAndImagesGrid({ albums, images }: { albums: TAlbum[]; images: TImage[] }) {
  return (
    <>
      <GridSelectionContainer>
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
      </GridSelectionContainer>
      <GridSelectionShortcuts albums={albums} images={images} />
    </>
  );
}
