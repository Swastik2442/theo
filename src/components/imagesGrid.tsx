import Image from "next/image";
import Link from "next/link";

import { images } from "~/server/db/schema"

type Image = Pick<typeof images.$inferSelect, "id" | "url" | "name">;

export async function ImagesGrid({ images }: { images: Image[] }) {
  return (
    <div className="p-4 flex flex-wrap gap-4 items-center justify-center">
      {images.map((image) => (
        <div key={image.id} className="w-48 flex flex-col">
          <Link href={`/images/${image.id}`}>
            <Image
              src={image.url} alt={image.name} title={image.name}
              width={192} height={192}
              className="aspect-square object-contain border rounded-md border-accent hover:border-accent-foreground"
            />
          </Link>
          <p className="max-w-48 text-center pt-1 truncate" title={image.name}>{removedExtension(image.name)}</p>
        </div>
      ))}
    </div>
  )
}

const fileExtensions = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'heic', 'heif', 'ico',
  'svg', 'eps', 'ai',
  'raw', 'cr2', 'nef', 'orf', 'sr2', 'arw', 'dng', 'rw2', 'pef',
  'avif', 'jxr', 'wdp', 'apng'
];

const fileRegex = new RegExp(`\\b[\\w\\-]+\\.(${fileExtensions.join('|')})\\b`, 'i');
const containsFileName = (str: string) => fileRegex.test(str);

// TODO: Handle no extension case
function removedExtension(name: string) {
  if (!containsFileName(name)) return name;
  return name.replace(/\.[^/.]+$/, "");
}

export default ImagesGrid;
