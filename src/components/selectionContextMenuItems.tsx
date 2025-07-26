"use client";

import { usePathname } from "next/navigation";
import { useShallow } from "zustand/react/shallow";

import { useRouteStore } from "~/contexts/stores/routeStoreProvider";
import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
import { useDialogStore } from "~/contexts/stores/dialogStoreProvider";
import { useDownloadSelection } from "~/hooks/downloadSelection";
import {
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuShortcut
} from "~/components/ui/context-menu";

// TODO: Implement cut and paste functionality
function CommonSelectionContextMenuItems() {
  const pathName = usePathname();
  const isHomePage = /^\/(?:\?.*)?$/gm.test(pathName);

  const { myAlbums, myAlbumImages } = useRouteStore(useShallow((s) => ({
    myAlbums: s.myAlbums,
    myAlbumImages: s.myAlbumImages
  })));
  const {
    notSelectionMode,
    selectedImages,
    selectedAlbums,
    modifyImages,
    modifyAlbums,
    reset
  } = useSelectionStore(useShallow((s) => ({
    notSelectionMode: s.selectedImages.size == 0 && s.selectedAlbums.size == 0,
    selectedImages: s.selectedImages,
    selectedAlbums: s.selectedAlbums,
    modifyImages: s.modifyImages,
    modifyAlbums: s.modifyAlbums,
    reset: s.reset
  })));

  const { setDialog, dialogOpen, setDialogOpen } = useDialogStore(useShallow((s) => ({
    setDialog: s.setDialog,
    dialogOpen: s.dialogOpen,
    setDialogOpen: s.setDialogOpen
  })));

  const { downloading, downloadSelection } = useDownloadSelection();

  return (
    <>
      <ContextMenuItem onSelect={() => {
        modifyImages(myAlbumImages.map((img) => img.id));
        if (isHomePage) {
          modifyAlbums(myAlbums.map((album) => album.id));
        }
      }} inset>
        Select All
        <ContextMenuShortcut>⌘A</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem onSelect={reset} disabled={notSelectionMode} inset>
        Deselect All
      </ContextMenuItem>
      <ContextMenuItem onSelect={() => {
        modifyImages(Array.from(new Set(myAlbumImages.map((img) => img.id)).difference(selectedImages)));
        if (isHomePage) {
          modifyAlbums(Array.from(new Set(myAlbums.map((album) => album.id)).difference(selectedAlbums)));
        }
      }} disabled={notSelectionMode} inset>
        Invert Selected Items
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() => { setDialog("MOVE_SELECTION"); setDialogOpen(true); }}
        disabled={notSelectionMode || dialogOpen}
        inset
      >
        Move Selected Items
      </ContextMenuItem>
      <ContextMenuItem disabled inset>
        Cut
        <ContextMenuShortcut>⌘X</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem disabled inset>
        Paste
        <ContextMenuShortcut>⌘V</ContextMenuShortcut>
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={downloadSelection}
        disabled={notSelectionMode || downloading}
        inset
      >
        Download
      </ContextMenuItem>
      <ContextMenuItem
        onSelect={() => { setDialog("DELETE_SELECTION"); setDialogOpen(true); }}
        disabled={notSelectionMode || dialogOpen}
        variant="destructive"
        inset
      >
        Delete
      </ContextMenuItem>
    </>
  );
}

export function ImageSelectionContextMenuItems({ imageId }: { imageId: number }) {
  const { isSelected, addToSelection, removeFromSelection } = useSelectionStore(useShallow((s) => ({
    isSelected: s.selectedImages.has(imageId),
    addToSelection: s.addImage,
    removeFromSelection: s.removeImage
  })));
  return (
    <ContextMenuGroup>
      <ContextMenuItem onSelect={() => {
        if (isSelected) {
          removeFromSelection(imageId);
        } else {
          addToSelection(imageId);
        }
      }} inset>
        {isSelected ? "Deselect Image" : "Select Image"}
      </ContextMenuItem>
      <CommonSelectionContextMenuItems />
    </ContextMenuGroup>
  );
}

export function AlbumSelectionContextMenuItems({ albumId }: { albumId: number }) {
  const { isSelected, addToSelection, removeFromSelection } = useSelectionStore(useShallow((s) => ({
    isSelected: s.selectedAlbums.has(albumId),
    addToSelection: s.addAlbum,
    removeFromSelection: s.removeAlbum
  })));
  return (
    <ContextMenuGroup>
      <ContextMenuItem onSelect={() => {
        if (isSelected) {
          removeFromSelection(albumId);
        } else {
          addToSelection(albumId);
        }
      }} inset>
        {isSelected ? "Deselect Album" : "Select Album"}
      </ContextMenuItem>
      <CommonSelectionContextMenuItems />
    </ContextMenuGroup>
  );
}
