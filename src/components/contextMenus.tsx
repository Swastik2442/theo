"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
          <ContextMenuItem disabled inset>
            Save Page
            <ContextMenuShortcut>⌘S</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem onSelect={() => window.print()} inset>
            Print Page
            <ContextMenuShortcut>⌘P</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem disabled inset>
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

// TODO: Add Image Link and Save Image as functionality
export function ImageContextMenu({ imageId, children }: { imageId: number; children: React.ReactNode; }) {
  const fullUrl = useClientHost();
  const imageLink = `${fullUrl}/images/${imageId}`;
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="print:hidden w-72">
        <ImageSelectionContextMenuItems imageId={imageId} />
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
          <ContextMenuSeparator />
          <ContextMenuItem inset>
            Open Image in new Tab
          </ContextMenuItem>
          <ContextMenuItem inset>
            Save Image as
          </ContextMenuItem>
          <ContextMenuItem inset>
            Copy Image
          </ContextMenuItem>
          <ContextMenuItem inset>
            Copy Image Link
          </ContextMenuItem>
        </ContextMenuGroup>
        <ContextMenuSeparator />
        <CommonContextMenuItems />
      </ContextMenuContent>
    </ContextMenu>
  );
}

export function AlbumContextMenu({ albumId, children }: { albumId: number; children: React.ReactNode; }) {
  const fullUrl = useClientHost();
  const albumLink = `${fullUrl}/albums/${albumId}`;
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="print:hidden w-72">
        <AlbumSelectionContextMenuItems albumId={albumId} />
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
