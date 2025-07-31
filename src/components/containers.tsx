"use client";

import {
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useShallow } from "zustand/react/shallow";

import { usePressedKeys } from "~/contexts/pressedKeysProvider";
import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
import { useAutoScroll } from "~/hooks/autoScroll";
import { useKeyPress } from "~/hooks/keyPress";
import { AlbumContextMenu, ImageContextMenu } from "~/components/contextMenus";
import {
  selectionIdAttr,
  selectionTypeAttr,
  createSelectionProps,
  getElementId
} from "~/utils/selection";
import { isMacOS } from "~/utils/platform";
import { cn } from "~/utils/css";

type TAlbum = Parameters<typeof AlbumContextMenu>['0']['album'];
type TImage = Parameters<typeof ImageContextMenu>['0']['image'];

/** Container for Album Card that handles Selection State and Context Menu */
export function AlbumCardContainer({ album, children }: { album: TAlbum; children: React.ReactNode; }) {
  const {
    selectionMode,
    isSelected,
    draggingMode,
    addToSelection,
    removeFromSelection
  } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedAlbums.has(album.id),
    draggingMode: s.draggingMode,
    addToSelection: s.addItem,
    removeFromSelection: s.removeItem
  })));
  const pressedKeysRef = usePressedKeys().keys;

  const selectionProps = useMemo(
    () => createSelectionProps("album", album.id, isSelected && !draggingMode),
    [album.id, isSelected, draggingMode]
  );

  if (selectionMode) {
    return (
      <AlbumContextMenu album={album}>
        <div onClick={() => {
          if (isSelected) {
            removeFromSelection({ id: album.id, type: "album" }, pressedKeysRef.current);
          } else {
            addToSelection({ id: album.id, type: "album" }, pressedKeysRef.current);
          }
        }} onDragStart={(e) => e.preventDefault()} className="group" {...selectionProps}>
          {children}
        </div>
      </AlbumContextMenu>
    );
  }

  if (draggingMode) {
    return (
      <div className="group" {...selectionProps}>
        {children}
      </div>
    );
  }

  return (
    <AlbumContextMenu album={album}>
      <Link href={`/albums/${album.id}`} onDragStart={(e) => e.preventDefault()} {...selectionProps}>
        {children}
      </Link>
    </AlbumContextMenu>
  );
}

/** Container for Image Card that handles Selection State and Context Menu */
export function ImageCardContainer({ image, children }: { image: TImage; children: React.ReactNode; }) {
  const {
    selectionMode,
    isSelected,
    draggingMode,
    draggingContainerRef,
    addToSelection,
    removeFromSelection
  } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    isSelected: s.selectedImages.has(image.id),
    draggingMode: s.draggingMode,
    draggingContainerRef: s.draggingContainerRef,
    addToSelection: s.addItem,
    removeFromSelection: s.removeItem
  })));
  const pressedKeysRef = usePressedKeys().keys;
  const selectionProps = useMemo(
    () => createSelectionProps("image", image.id, isSelected),
    [image.id, isSelected]
  );

  if (selectionMode) {
    return (
      <ImageContextMenu image={image}>
        <div onClick={() => {
          if (isSelected) {
            removeFromSelection({ id: image.id, type: "image" }, pressedKeysRef.current);
          } else {
            addToSelection({ id: image.id, type: "image" }, pressedKeysRef.current);
          }
        }} onDragStart={(e) => e.preventDefault()} className="group" {...selectionProps}>
          {children}
        </div>
      </ImageContextMenu>
    );
  }

  if (isSelected && draggingMode && draggingContainerRef.current !== null) {
    return (
      <>
        <div className="group invisible">
          {children}
        </div>
        {createPortal(
          <div data-dragging={true} className="group">
            {children}
          </div>,
          draggingContainerRef.current
        )}
      </>
    );
  }

  return (
    <ImageContextMenu image={image}>
      <Link href={`/images/${image.id}`} onDragStart={(e) => e.preventDefault()} {...selectionProps}>
        {children}
      </Link>
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

export function GridDraggingContainer() {
  const {
    draggingEnabled,
    draggingMode,
    setDraggingMode,
    movingIntoAlbum,
    setMovingIntoAlbum,
    draggingContainerRef,
    selectionContainerRef
  } = useSelectionStore(useShallow((s) => ({
    draggingEnabled: s.selectedAlbums.size === 0,
    draggingMode: s.draggingMode,
    setDraggingMode: s.setDraggingMode,
    movingIntoAlbum: s.movingIntoAlbum,
    setMovingIntoAlbum: s.setMovingIntoAlbum,
    draggingContainerRef: s.draggingContainerRef,
    selectionContainerRef: s.selectionContainerRef
  })));
  const [mousePos, setMousePos] = useState({ left: 0, top: 0 });

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Only handle if dragging is enabled or dragging mode is off or on left mouse button clicks
    if (!draggingEnabled || draggingMode || e.button != 0) return;

    const rootElement = selectionContainerRef.current;
    if (!rootElement) return;
    const rootRect = rootElement.getBoundingClientRect();

    // Ensure click is within root element
    if (e.clientX < rootRect.left
    || e.clientX > rootRect.right - 2
    || e.clientY < rootRect.top
    || e.clientY > rootRect.bottom - 2) return;

    const startX = e.clientX + window.scrollX;
    const startY = e.clientY + window.scrollY;

    // Ensure click is on an image
    const clickedItem = document.elementFromPoint(startX, startY);
    if (!(clickedItem && (clickedItem.hasAttribute(selectionTypeAttr) || clickedItem.closest(`[${selectionTypeAttr}="image"]`)))) {
      return;
    }
    const shiftX = startX - clickedItem.getBoundingClientRect().left;
    const shiftY = startY - clickedItem.getBoundingClientRect().top;

    setDraggingMode(true);
    setMousePos({ left: startX - shiftX, top: startY - shiftY });

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX + window.scrollX;
      const currentY = e.clientY + window.scrollY;

      setMousePos({ left: currentX - shiftX, top: currentY - shiftY });

      let overItem = document.elementFromPoint(currentX, currentY);
      if (overItem === null) {
        setMovingIntoAlbum(null);
        return;
      }
      if (!overItem.hasAttribute(selectionTypeAttr))  {
        overItem = overItem.closest(`[${selectionTypeAttr}="album"]`);
        if (overItem === null) {
          setMovingIntoAlbum(null);
          return;
        }
      }

      const elemId = getElementId(overItem);
      if (elemId !== movingIntoAlbum) setMovingIntoAlbum(elemId);
    };
    const handleMouseUp = (e: MouseEvent) => {
      setDraggingMode(false);
      // TODO: If mouse is over an album, move items to album
      if (movingIntoAlbum !== null) {}
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [setMousePos])

  useEffect(() => {
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [handleMouseDown]);

  return (
    <div
      ref={draggingContainerRef}
      style={mousePos}
      className={cn(
        "cursor-move absolute *:absolute",
        "*:first:inset-0 *:first:z-[10]",
        "*:nth-[2]:-top-1.5 *:nth-[2]:left-1.5 *:nth-[2]:z-[9]",
        "*:nth-[3]:-top-3 *:nth-[3]:left-3 *:nth-[3]:z-[8]",
        "*:nth-[4]:-top-4.5 *:nth-[4]:left-4.5 *:nth-[4]:z-[7]",
        "*:nth-[5]:-top-6 *:nth-[5]:left-6 *:nth-[5]:z-[6]",
        "[&>*:nth-child(5)~*]:hidden",
        !draggingMode && "hidden"
      )}
    >
    </div>
  );
}

type SelectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/** Container that handles Selection Box for Grid Items */
export function GridSelectionContainer({ children }: { children: React.ReactNode }) {
  const {
    selectingEnabled,
    draggingMode,
    selectionContainerRef,
    selectedAlbums,
    selectedImages,
    modifyAlbums,
    modifyImages,
    setLastSelectedItem,
    reset
  } = useSelectionStore(useShallow((s) => ({
    selectingEnabled: s.selectingEnabled,
    draggingMode: s.draggingMode,
    selectionContainerRef: s.selectionContainerRef,
    selectedAlbums: s.selectedAlbums,
    selectedImages: s.selectedImages,
    lastSelectedItem: s.lastSelectedItem,
    modifyAlbums: s.modifyAlbums,
    modifyImages: s.modifyImages,
    setLastSelectedItem: s.setLastSelectedItem,
    reset: s.reset
  })));
  const pressedKeysRef = usePressedKeys().keys;
  const { startScrollingUp, startScrollingDown, stopScrolling } = useAutoScroll();

  const [selectionBox, setSelectionBox] = useState<SelectionBox>({ left: 0, top: 0, width: 0, height: 0 });
  const [selectionBoxActive, setSelectionBoxActive] = useState(false);

  // BUG: The selection box will not get updated if the mouse remains stationary after auto-scroll
  const handleMouseDown: MouseEventHandler<HTMLDivElement> = useCallback((e) => {
    // Only handle if selecting functionality is enabled or dragging mode is disabled or on left mouse button clicks
    if (!selectingEnabled || draggingMode || e.button != 0) return;

    const rootElement = selectionContainerRef.current;
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
        // Near bottom
        startScrollingDown();
      } else if (currentY < 50 && window.scrollY > 0) {
        // Near top
        startScrollingUp();
      } else {
        // Within bounds
        stopScrolling();
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setSelectionBoxActive(false);
      stopScrolling();
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [setSelectionBox, setSelectionBoxActive, stopScrolling]);

  const handleBlur = useCallback(() => setSelectionBoxActive(false), [setSelectionBoxActive]);
  useEffect(() => {
    document.addEventListener("blur", handleBlur, true);
    return () => document.removeEventListener("blur", handleBlur, true);
  }, [handleBlur]);

  /** Checks if an element intersects with the selection box */
  const isElementIntersecting = (element: Element) => {
    if (!element.hasAttribute(selectionIdAttr)) return false;
    const itemRect = element.getBoundingClientRect();
    return !(
      itemRect.x > selectionBox.left + selectionBox.width ||
      itemRect.x + itemRect.width < selectionBox.left ||
      itemRect.y > selectionBox.top + selectionBox.height ||
      itemRect.y + itemRect.height < selectionBox.top
    );
  };

  // Check which items intersect with selection
  useEffect(() => {
    const containerDiv = selectionContainerRef.current;
    if (!selectingEnabled || draggingMode || !selectionBoxActive || !containerDiv) return;

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
      <div ref={selectionContainerRef} onMouseDown={handleMouseDown} className="min-h-full">
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
