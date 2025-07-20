"use client";

import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { usePressedKeys } from "~/contexts/pressedKeysProvider";
import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
import { useKeyPress } from "~/hooks/keyPress";
import { AlbumContextMenu, ImageContextMenu } from "~/components/contextMenus";
import {
  selectionIdAttr,
  selectionTypeAttr,
  createSelectionProps,
  getElementId
} from "~/utils/selection";
import { isMacOS } from "~/utils/platform";

type TAlbum = Parameters<typeof AlbumContextMenu>['0']['album'];
type TImage = Parameters<typeof ImageContextMenu>['0']['image'];

/** Container for Album Card that handles Selection State and Context Menu */
export function AlbumCardContainer({ album, children }: { album: TAlbum; children: React.ReactNode; }) {
  const {
    selectionMode,
    isSelected,
    addToSelection,
    removeFromSelection
  } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedAlbums.has(album.id),
    addToSelection: s.addItem,
    removeFromSelection: s.removeItem
  })));
  const pressedKeysRef = usePressedKeys().keys;

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
          removeFromSelection({ id: album.id, type: "album" }, pressedKeysRef.current);
        } else {
          addToSelection({ id: album.id, type: "album" }, pressedKeysRef.current);
        }
      }}>
        {children}
      </div>
    </AlbumContextMenu>
  );
}

/** Container for Image Card that handles Selection State and Context Menu */
export function ImageCardContainer({ image, children }: { image: TImage; children: React.ReactNode; }) {
  const {
    selectionMode,
    isSelected,
    addToSelection,
    removeFromSelection
  } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedImages.has(image.id),
    addToSelection: s.addItem,
    removeFromSelection: s.removeItem
  })));
  const pressedKeysRef = usePressedKeys().keys;
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
          removeFromSelection({ id: image.id, type: "image" }, pressedKeysRef.current);
        } else {
          addToSelection({ id: image.id, type: "image" }, pressedKeysRef.current);
        }
      }}>
        {children}
      </div>
    </ImageContextMenu>
  );
}

/** Adds Keyboard Shortcuts for Selection Options in the Grid */
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

const scrollSpeed = 5;
type SelectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Container that handles Selection Box for Grid Items */
export function GridSelectionContainer({ children }: { children: React.ReactNode }) {
  const {
    containerRef,
    selectedAlbums,
    selectedImages,
    modifyAlbums,
    modifyImages,
    setLastSelectedItem,
    reset
  } = useSelectionStore(useShallow((s) => ({
    containerRef: s.containerRef,
    selectedAlbums: s.selectedAlbums,
    selectedImages: s.selectedImages,
    lastSelectedItem: s.lastSelectedItem,
    modifyAlbums: s.modifyAlbums,
    modifyImages: s.modifyImages,
    setLastSelectedItem: s.setLastSelectedItem,
    reset: s.reset
  })));
  const pressedKeysRef = usePressedKeys().keys;
  const scrollFrameRef = useRef<number | null>(null);

  const [selectionBox, setSelectionBox] = useState<SelectionBox>({ left: 0, top: 0, width: 0, height: 0 });
  const [selectionBoxActive, setSelectionBoxActive] = useState(false);

  // BUG: The selection box will not get updated if the mouse remains stationary after auto-scroll
  const autoScrollDown = useCallback(() => {
    window.scrollBy(0, scrollSpeed);

    if (scrollFrameRef.current == null) return;                              // Stop if cancelled
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight) { // Stop if at bottom of page
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
      return;
    }
    scrollFrameRef.current = requestAnimationFrame(autoScrollDown);          // Keep looping
  }, [scrollFrameRef]);
  const autoScrollUp = useCallback(() => {
    window.scrollBy(0, -scrollSpeed);

    if (scrollFrameRef.current == null) return;                   // Stop if cancelled
    if (window.scrollY <= 0) {                                    // Stop if at top of page
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
      return;
    }
    scrollFrameRef.current = requestAnimationFrame(autoScrollUp); // Keep looping
  }, [scrollFrameRef]);

  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    // Only handle left mouse button clicks
    if (e.button != 0) return;

    const rootElement = containerRef.current;
    if (!rootElement) return;
    const rootRect = rootElement.getBoundingClientRect();

    // Ensure click is within root element
    if (e.clientX < rootRect.left
    || e.clientX > rootRect.right - 2
    || e.clientY < rootRect.top
    || e.clientY > rootRect.bottom - 2) return;

    // Ensure click is not on an item
    const clickedItem = document.elementFromPoint(e.clientX, e.clientY);
    if (clickedItem && (clickedItem.hasAttribute(selectionTypeAttr) || clickedItem.closest(`[${selectionTypeAttr}]`))) {
      return;
    }

    const startX = e.clientX + window.scrollX;
    const startY = e.clientY + window.scrollY;

    setSelectionBox({ left: startX, top: startY, width: 0, height: 0 });
    setSelectionBoxActive(true);

    const handleMouseMove = (me: MouseEvent) => {
      const currentX = me.clientX + window.scrollX;
      const currentY = me.clientY + window.scrollY;
      const left = Math.min(startX, currentX);
      const top = Math.min(startY, currentY);
      const currentWidth = Math.abs(currentX - startX);
      const currentHeight = Math.abs(currentY - startY);
      const maxWidth = Math.abs(rootRect.right + window.scrollX - left);
      const maxHeight = Math.abs(rootRect.bottom + window.scrollY - top);
      const width = Math.min(currentWidth, maxWidth);
      const height = Math.min(currentHeight, maxHeight);
      setSelectionBox({ left, top, width, height });

      // Scroll container if mouse goes out of bounds
      if (currentY > window.innerHeight - 50 && currentY < document.body.scrollHeight) {
        // Near bottom - start scrolling down
        if (!scrollFrameRef.current) {
          scrollFrameRef.current = requestAnimationFrame(autoScrollDown);
        }
      } else if (currentY < 50 && window.scrollY > 0) {
        // Near top - start scrolling up
        if (!scrollFrameRef.current) {
          scrollFrameRef.current = requestAnimationFrame(autoScrollUp);
        }
      } else if (scrollFrameRef.current) {
        // Within bounds - stop scrolling
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setSelectionBoxActive(false);
      if (scrollFrameRef.current) { // Stop any ongoing auto-scroll
        cancelAnimationFrame(scrollFrameRef.current);
        scrollFrameRef.current = null;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [containerRef, setSelectionBox, setSelectionBoxActive]);

  const handleBlur = useCallback(() => {
    setSelectionBoxActive(false);
    if (scrollFrameRef.current) {
      cancelAnimationFrame(scrollFrameRef.current);
      scrollFrameRef.current = null;
    }
  }, [setSelectionBoxActive, scrollFrameRef]);
  useEffect(() => {
    document.addEventListener("blur", handleBlur, true);
    return () => document.removeEventListener("blur", handleBlur, true);
  }, [handleBlur]);

  /** Checks if an element intersects with the selection box */
  const isElementIntersecting = useCallback((element: Element) => {
    if (!element.hasAttribute(selectionIdAttr)) return false;
    const itemRect = element.getBoundingClientRect();
    return !(
      itemRect.x > selectionBox.left + selectionBox.width ||
      itemRect.x + itemRect.width < selectionBox.left ||
      itemRect.y > selectionBox.top + selectionBox.height ||
      itemRect.y + itemRect.height < selectionBox.top
    );
  }, [selectionBox]);

  // Check which items intersect with selection
  useEffect(() => {
    const containerDiv = containerRef.current;
    if (!selectionBoxActive || !containerDiv) return;

    const albumItems = Array.from(containerDiv.querySelectorAll(`*[${selectionTypeAttr}='album']`));
    const imageItems = Array.from(containerDiv.querySelectorAll(`*[${selectionTypeAttr}='image']`));

    const selectedAlbumIds = albumItems.filter(isElementIntersecting).map(getElementId);
    const selectedImageIds = imageItems.filter(isElementIntersecting).map(getElementId);

    // Handle Ctrl/Meta and Shift keys for multi-selection
    if (pressedKeysRef.current.shiftKey
    || (isMacOS() ? pressedKeysRef.current.metaKey : pressedKeysRef.current.ctrlKey)) {
      if (selectedAlbumIds.length > 0) {
        modifyAlbums([...selectedAlbums, ...selectedAlbumIds]);
      }
      if (selectedImageIds.length > 0) {
        modifyImages([...selectedImages, ...selectedImageIds]);
      }
      if (selectedAlbumIds.length > 0 || selectedImageIds.length > 0) {
        if (selectedImageIds.length > 0) {
          setLastSelectedItem({ id: selectedImageIds[selectedImageIds.length - 1]!, type: "image" });
        } else {
          setLastSelectedItem({ id: selectedAlbumIds[selectedAlbumIds.length - 1]!, type: "album" });
        }
      }
      return;
    }

    // No modifier keys - replace selection
    if (selectedAlbumIds.length > 0) {
      modifyAlbums(selectedAlbumIds);
    }
    if (selectedImageIds.length > 0) {
      modifyImages(selectedImageIds);
    }
    if (selectedAlbumIds.length > 0 || selectedImageIds.length > 0) {
      if (selectedImageIds.length > 0) {
        setLastSelectedItem({ id: selectedImageIds[selectedImageIds.length - 1]!, type: "image" });
      } else {
        setLastSelectedItem({ id: selectedAlbumIds[selectedAlbumIds.length - 1]!, type: "album" });
      }
    } else {
      reset();
    }
  }, [selectionBox]);

  return (
    <>
      <div ref={containerRef} onMouseDown={handleMouseDown} className="min-h-full">
        {children}
      </div>
      {selectionBoxActive && (
        <div
          className="absolute border border-blue-600 bg-blue-400/50 pointer-events-none"
          style={selectionBox}
        ></div>
      )}
    </>
  );
}
