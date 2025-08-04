import { ArrowUpRight } from "lucide-react";

import ImageWithoutDrag from "~/components/ImageWithoutDrag";
import { UploadIcon } from "~/components/ui/icons";

export function NotSignedIn() {
  return (
    <div className="w-full h-[80%] flex flex-col gap-y-3 items-center justify-center text-gray-500 select-none">
      <ImageWithoutDrag src="/thumbnail.png" alt="Thumbnail" width={57} height={50} />
      <div className="flex flex-col text-center gap-x-1">
        <span>Start creating your online gallery</span>
        <span>Sign in to continue</span>
      </div>
    </div>
  );
}

export function NoAlbumsAndImages() {
  return (
    <div className="w-full h-[80%] flex flex-col gap-y-3 items-center justify-center text-gray-500 select-none">
      <ImageWithoutDrag src="/thumbnail.png" alt="Thumbnail" width={57} height={50} />
      <div className="flex flex-col text-center gap-x-1">
        <span>Start creating your online gallery</span>
        <span>by uploading images using the <UploadIcon className="inline-block size-5 fill-background" /><span className="sr-only">upload</span> button above <ArrowUpRight className="inline-block size-5" /></span>
        <span>or by dragging and dropping images here</span>
      </div>
    </div>
  );
}

export function NoImages() {
  return (
    <div className="w-full h-[80%] flex flex-col gap-y-3 items-center justify-center text-gray-500 select-none">
      <ImageWithoutDrag src="/thumbnail.png" alt="Thumbnail" width={57} height={50} />
      <div className="flex flex-col text-center gap-x-1">
        <span>Upload images using the <UploadIcon className="inline-block size-5 fill-background" /><span className="sr-only">upload</span> button above <ArrowUpRight className="inline-block size-5" /></span>
        <span>or by dragging and dropping images here</span>
      </div>
    </div>
  );
}
