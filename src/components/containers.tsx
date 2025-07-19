"use client";

import { MouseEventHandler, use, useCallback, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { useSelectionStore } from "~/contexts/selectionStoreProvider";
import { useKeyPress } from "~/hooks/keyPress";
import { AlbumContextMenu, ImageContextMenu } from "~/components/contextMenus";

type TAlbum = Parameters<typeof AlbumContextMenu>['0']['album'];
type TImage = Parameters<typeof ImageContextMenu>['0']['image'];
const selectionTypeAttr = "data-selection-type";
const selectionIdAttr = "data-selection-id";
const selectedAttr = "data-selected";
const createSelectionProps = (type: "album" | "image", id: number, selected: boolean) => ({
  [selectionTypeAttr]: type,
  [selectionIdAttr]: id,
  [selectedAttr]: selected
});

export function AlbumCardContainer({ album, children }: { album: TAlbum; children: React.ReactNode; }) {
  const { selectionMode, isSelected, addToSelection, removeFromSelection } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedAlbums.has(album.id),
    addToSelection: s.addAlbum,
    removeFromSelection: s.removeAlbum
  })));
  const selectionProps = useMemo(
    () => createSelectionProps("album", album.id, isSelected),
    [album.id, isSelected]
  );

  if (!selectionMode) {
    return (
      <AlbumContextMenu album={album}>
        <Link {...selectionProps} href={`/albums/${album.id}`}>
          {children}
        </Link>
      </AlbumContextMenu>
    );
  }

  return (
    <AlbumContextMenu album={album}>
      <div className="group" {...selectionProps} onClick={() => {
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
  const selectionProps = useMemo(
    () => createSelectionProps("image", image.id, isSelected),
    [image.id, isSelected]
  );

  if (!selectionMode) {
    return (
      <ImageContextMenu image={image}>
        <Link {...selectionProps} href={`/images/${image.id}`}>
          {children}
        </Link>
      </ImageContextMenu>
    );
  }

  return (
    <ImageContextMenu image={image}>
      <div className="group" {...selectionProps} onClick={() => {
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

const getItemId = (item: Element) => Number(item.getAttribute(selectionIdAttr)!);
export function GridSelectionContainer({ children }: { children: React.ReactNode }) {
  const {
    selectionBox,
    setSelectionBox,
    selectionBoxActive,
    setSelectionBoxActive,
    selectedAlbums,
    selectedImages,
    modifyAlbums,
    modifyImages
  } = useSelectionStore(useShallow((s) => ({
    selectionBox: s.selectionBox,
    setSelectionBox: s.setSelectionBox,
    selectionBoxActive: s.selectionBoxActive,
    setSelectionBoxActive: s.setSelectionBoxActive,
    selectedAlbums: s.selectedAlbums,
    selectedImages: s.selectedImages,
    modifyAlbums: s.modifyAlbums,
    modifyImages: s.modifyImages
  })));
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Only handle left mouse button clicks
    if (e.button !== 0) return;

    const rootElement = document.getElementById("root");
    if (!rootElement || !containerRef.current) return;
    const rootRect = rootElement.getBoundingClientRect();

    const startX = e.clientX + window.scrollX;
    const startY = e.clientY + window.scrollY;

    // Ensure click is within root element
    if (startX < rootRect.left
    || startX > rootRect.right + (2 * window.scrollX) - 2
    || startY < rootRect.top
    || startY > rootRect.bottom + (2 * window.scrollY) - 2) return;

    // TODO: Ensure click is not on an item

    setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
    setSelectionBoxActive(true);

    const handleMouseMove = (me: MouseEvent) => {
      const currentX = me.clientX + window.scrollX;
      const currentY = me.clientY + window.scrollY;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const currentWidth = Math.abs(currentX - startX);
      const currentHeight = Math.abs(currentY - startY);
      const maxWidth = Math.abs(rootRect.right + (2 * window.scrollX) - left);
      const maxHeight = Math.abs(rootRect.bottom + (2 * window.scrollY) - top);
      const width = Math.min(currentWidth, maxWidth);
      const height = Math.min(currentHeight, maxHeight);

      setSelectionBox({ left, top, width, height });
    };

    const handleMouseUp = () => {
      setSelectionBoxActive(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [containerRef, setSelectionBox, setSelectionBoxActive]);

  const isItemIntersecting = useCallback((item: Element) => {
    if (!item.hasAttribute(selectionIdAttr)) return false;
    const itemRect = item.getBoundingClientRect();
    return !(
      itemRect.x > selectionBox.left + selectionBox.width ||
      itemRect.x + itemRect.width < selectionBox.left ||
      itemRect.y > selectionBox.top + selectionBox.height ||
      itemRect.y + itemRect.height < selectionBox.top
    );
  }, [selectionBox]);

  // Add event listeners for mouse down to start selection
  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [handleMouseDown]);

  // Check which items intersect with selection
  useEffect(() => {
    const containerDiv = containerRef.current;
    if (!selectionBoxActive || !containerDiv) return;

    const albumItems = Array.from(containerDiv.querySelectorAll(`*[${selectionTypeAttr}='album']`));
    const imageItems = Array.from(containerDiv.querySelectorAll(`*[${selectionTypeAttr}='image']`));

    const selectedAlbumIds = albumItems.filter(isItemIntersecting).map(getItemId);
    const selectedImageIds = imageItems.filter(isItemIntersecting).map(getItemId);

    modifyAlbums(selectedAlbumIds);
    modifyImages(selectedImageIds);
  }, [selectionBox, selectionBoxActive]);

  return (
    <div ref={containerRef}>
      {children}
      {selectionBoxActive && (
        <div
          className="absolute border border-blue-600 bg-blue-200/80 pointer-events-none"
          style={selectionBox}
        ></div>
      )}
    </div>
  );
}
