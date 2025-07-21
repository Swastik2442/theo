"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { albums, images } from "~/server/db/schema"
import useClientHost from "~/hooks/clientHost";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from "~/components/ui/context-menu";
import {
  AlbumSelectionContextMenuItems,
  ImageSelectionContextMenuItems
} from "~/components/selectionContextMenuItems";
import { copyImageToClipboard, downloadFromUrl } from "~/utils/file";

type TAlbum = Pick<typeof albums.$inferSelect, "id">;
type TImage = Pick<typeof images.$inferSelect, "id" | "name" | "url">;

function CommonContextMenuItems() {
  const router = useRouter();
  return (
    <ContextMenuGroup>
      <ContextMenuItem onSelect={router.back} inset>
        Back
        <ContextMenuShortcut>⌘[</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onSelect={router.forward} inset>
        Forward
        <ContextMenuShortcut>⌘]</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onSelect={router.refresh} inset>
        Reload
        <ContextMenuShortcut>⌘R</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuSub>
        <ContextMenuSubTrigger inset>More Tools</ContextMenuSubTrigger>
        <ContextMenuSubContent>
          <ContextMenuItem inset>
            Save Page
            <ContextMenuShortcut>⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => window.print()} inset>
            Print Page
            <ContextMenuShortcut>⌘P</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem inset>
            Developer Tools
            <ContextMenuShortcut>⌘ Shift I</ContextMenuShortcut>
          </ContextMenuItem>
        </ContextMenuSubContent>
      </ContextMenuSub>
    </ContextMenuGroup>
  );
}

export function NormalContextMenu({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="print:hidden w-64">
        <CommonContextMenuItems />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function ImageContextMenu({ image, children }: { image: TImage; children: React.ReactNode; }) {
  const fullUrl = useClientHost();
  const imageLink = `${fullUrl}/images/${image.id}`;
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="print:hidden w-72">
        <ImageSelectionContextMenuItems imageId={image.id} />
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onSelect={() => window.open(imageLink, "_blank")} inset>
            Open Link in new Tab
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => {
            navigator.clipboard.writeText(imageLink);
            toast.info("Link copied to clipboard");
          }} inset>
            Copy Link
          </ContextMenuItem>
          {image.url && (<>
            <ContextMenuSeparator />
            <ContextMenuItem onSelect={() => window.open(image.url, "_blank")} inset>
              Open Image in new Tab
            </ContextMenuItem>
            <ContextMenuItem onSelect={async () => {
              try {
                await downloadFromUrl(image.name, image.url);
              } catch (error) {
                console.error(error);
                toast.error("Failed to download image");
              }
            }} inset>
              Save Image as
            </ContextMenuItem>
            <ContextMenuItem onSelect={async () => {
              try {
                await copyImageToClipboard(image.url);
                toast.info("Image copied to clipboard");
              } catch (error) {
                console.error(error);
                toast.error("Failed to copy image");
              }
            }} inset>
              Copy Image
            </ContextMenuItem>
            <ContextMenuItem onSelect={() => {
              navigator.clipboard.writeText(image.url);
              toast.info("Link copied to clipboard");
            }} inset>
              Copy Image Link
            </ContextMenuItem>
          </>)}
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <CommonContextMenuItems />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function AlbumContextMenu({ album, children }: { album: TAlbum; children: React.ReactNode; }) {
  const fullUrl = useClientHost();
  const albumLink = `${fullUrl}/albums/${album.id}`;
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="print:hidden w-72">
        <AlbumSelectionContextMenuItems albumId={album.id} />
        <ContextMenuSeparator />
        <ContextMenuGroup>
          <ContextMenuItem onSelect={() => window.open(albumLink, "_blank")} inset>
            Open Link in new Tab
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => {
            navigator.clipboard.writeText(albumLink);
            toast.info("Link copied to clipboard");
          }} inset>
            Copy Link
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <CommonContextMenuItems />
      </ContextMenuContent>
    </ContextMenu>
  );
}
