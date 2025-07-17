"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { albums, images } from "~/server/db/schema"
import { useSelectionStore } from "~/contexts/selectionStoreProvider";
import { useKeyPress } from "~/hooks/keyPress";
import { AlbumContextMenu, ImageContextMenu } from "~/components/contextMenus";

type TAlbum = Pick<typeof albums.$inferSelect, "id">;
type TImage = Pick<typeof images.$inferSelect, "id">;

export function AlbumCardContainer({ album, children }: { album: TAlbum; children: React.ReactNode; }) {
  const { selectionMode, isSelected, addToSelection, removeFromSelection } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedAlbums.has(album.id),
    addToSelection: s.addAlbum,
    removeFromSelection: s.removeAlbum
  })));
  if (!selectionMode) {
    return (
      <AlbumContextMenu albumId={album.id}>
        <Link href={`/albums/${album.id}`}>
          {children}
        </Link>
      </AlbumContextMenu>
    );
  }

  return (
    <AlbumContextMenu albumId={album.id}>
      <div className="group" data-selected={isSelected} onClick={() => {
        if (isSelected) {
          removeFromSelection(album.id);
        } else {
          addToSelection(album.id);
        }
      }}>
        {children}
      </div>
    </AlbumContextMenu>
  );
}

export function ImageCardContainer({ image, children }: { image: TImage; children: React.ReactNode; }) {
  const { selectionMode, isSelected, addToSelection, removeFromSelection } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedImages.has(image.id),
    addToSelection: s.addImage,
    removeFromSelection: s.removeImage
  })));
  if (!selectionMode) {
    return (
      <ImageContextMenu imageId={image.id}>
        <Link href={`/images/${image.id}`}>
          {children}
        </Link>
      </ImageContextMenu>
    );
  }

  return (
    <ImageContextMenu imageId={image.id}>
      <div className="group" data-selected={isSelected} onClick={() => {
        if (isSelected) {
          removeFromSelection(image.id);
        } else {
          addToSelection(image.id);
        }
      }}>
        {children}
      </div>
    </ImageContextMenu>
  );
}

export function GridSelectionShortcuts({ albums, images }: { albums: TAlbum[]; images: TImage[] }) {
  const { modifyAlbums, modifyImages, reset } = useSelectionStore(useShallow((s) => ({
    modifyAlbums: s.modifyAlbums,
    modifyImages: s.modifyImages,
    reset: s.reset
  })));

  useKeyPress(reset, { key: "Escape" });
  useKeyPress(() => {
    modifyAlbums(albums.map((a) => a.id));
    modifyImages(images.map((i) => i.id));
  }, { key: "a", ctrlOrMetaKey: true });

  useEffect(() => {
    return () => reset();
  }, []);

  return null;
}
