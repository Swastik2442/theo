"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { useSelectionStore } from "~/contexts/selectionStoreProvider";
import { useKeyPress } from "~/hooks/keyPress";
import { AlbumContextMenu, ImageContextMenu } from "~/components/contextMenus";

type TAlbum = Parameters<typeof AlbumContextMenu>['0']['album'];
type TImage = Parameters<typeof ImageContextMenu>['0']['image'];

export function AlbumCardContainer({ album, children }: { album: TAlbum; children: React.ReactNode; }) {
  const { selectionMode, isSelected, addToSelection, removeFromSelection } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedAlbums.has(album.id),
    addToSelection: s.addAlbum,
    removeFromSelection: s.removeAlbum
  })));
  if (!selectionMode) {
    return (
      <AlbumContextMenu album={album}>
        <Link href={`/albums/${album.id}`}>
          {children}
        </Link>
      </AlbumContextMenu>
    );
  }

  return (
    <AlbumContextMenu album={album}>
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
      <ImageContextMenu image={image}>
        <Link href={`/images/${image.id}`}>
          {children}
        </Link>
      </ImageContextMenu>
    );
  }

  return (
    <ImageContextMenu image={image}>
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

export function GridSelectionShortcuts({ albums, images }: { albums: Pick<TAlbum, "id">[]; images: Pick<TImage, "id">[] }) {
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
