"use client";

import {
  MouseEventHandler,
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { moveImagesAction } from "~/server/actions";
import { usePressedKeys } from "~/contexts/pressedKeysProvider";
import { useRouteStore } from "~/contexts/stores/routeStoreProvider";
import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
import { useAutoScroll } from "~/hooks/autoScroll";
import { useKeyPress } from "~/hooks/keyPress";
import { AlbumContextMenu, ImageContextMenu } from "~/components/contextMenus";
import {
  createSelectionProps,
  getElementId,
  selectedAttr,
  selectionIdAttr,
  selectionTypeAttr
} from "~/utils/selection";
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

  if (draggingMode) {
    return (
      <div className="group" {...selectionProps}>
        {children}
      </div>
    );
  }

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

  return (
    <ImageContextMenu image={image}>
      <Link href={`/images/${image.id}`} onDragStart={(e) => e.preventDefault()} {...selectionProps}>
        {children}
      </Link>
    </ImageContextMenu>
  );
}

/** Adds Keyboard Shortcuts for Selection Options in the Grid */
export function GridSelectionShortcuts({ albums, images }: { albums?: Pick<TAlbum, "id">[]; images?: Pick<TImage, "id">[] }) {
  const { modifyAlbums, modifyImages, reset } = useSelectionStore(useShallow((s) => ({
    modifyAlbums: s.modifyAlbums,
    modifyImages: s.modifyImages,
    reset: s.reset
  })));

  useKeyPress(reset, { key: "Escape" });
  useKeyPress(() => {
    if (albums !== undefined) modifyAlbums(albums.map((a) => a.id));
    if (images !== undefined) modifyImages(images.map((i) => i.id));
  }, { key: "a", ctrlOrMetaKey: true });

  useEffect(() => {
    return () => reset();
  }, []);

  return null;
}

// TODO: Fix dragging and selecting to ensure working while scrolling

/** Container that handles Dragging for Images and Dropping for Albums */
export function GridDraggingContainer() {
  const router = useRouter();
  const myAlbums = useRouteStore(useShallow((s) => s.myAlbums));
  const {
    selectedImages,
    selectingEnabled,
    draggingMode,
    setDraggingMode,
    movingIntoAlbum,
    setMovingIntoAlbum,
    draggingContainerRef,
    selectionContainerRef,
    addItem,
    reset
  } = useSelectionStore(useShallow((s) => ({
    selectedImages: s.selectedImages,
    selectingEnabled: s.selectingEnabled,
    draggingMode: s.draggingMode,
    setDraggingMode: s.setDraggingMode,
    movingIntoAlbum: s.movingIntoAlbum,
    setMovingIntoAlbum: s.setMovingIntoAlbum,
    draggingContainerRef: s.draggingContainerRef,
    selectionContainerRef: s.selectionContainerRef,
    addItem: s.addItem,
    reset: s.reset
  })));
  const pressedKeysRef = usePressedKeys().keys;
  const [mousePos, setMousePos] = useState({ left: 0, top: 0 });

  const [state, formAction, pending] = useActionState(moveImagesAction, { status: "init" });

  // NOTE: the refs are required as without them, the latest values are not captured, even though Zustand useShallow is used
  const movingIntoAlbumRef = useRef(movingIntoAlbum);
  const selectedImagesRef = useRef(selectedImages);
  useEffect(() => { movingIntoAlbumRef.current = movingIntoAlbum; }, [movingIntoAlbum]);
  useEffect(() => { selectedImagesRef.current = selectedImages; }, [selectedImages]);

  /** Moves the selected Images to the specified album */
  const moveSelectionToAlbum = () => {
    if (movingIntoAlbumRef.current !== null && selectedImagesRef.current.size > 0) {
      startTransition(() => {
        const formData = new FormData();
        formData.append("albumId", JSON.stringify(movingIntoAlbumRef.current));
        formData.append("imageIds", JSON.stringify(Array.from(selectedImagesRef.current)));
        formAction(formData);
        toast.loading("Moving Images", {
          id: "move_images_begin",
          duration: 60000
        });
      });
    }
  };

  // Handle Form Submission Result
  useEffect(() => {
    toast.dismiss("move_images_begin");
    if (state.status == 'error') {
      toast[state.status](state.message, {
        duration: 5000,
        description: state.data
      });
    } else if (state.status == 'success') {
      const albumName = movingIntoAlbum === null ? "Home" : myAlbums.find(v => v.id === movingIntoAlbum)?.name;
      toast.success(`${selectedImages.size} Image${selectedImages.size === 1 ? '' : 's'} moved${albumName && ` to ${albumName}`}`);
      reset();
      router.refresh();
    }
  }, [state]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    // Only handle if selecting is enabled or dragging mode is off or on left mouse button clicks
    if (pending || !selectingEnabled || draggingMode || e.button != 0) return;

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
    let clickedItem = document.elementFromPoint(startX, startY);
    if (!clickedItem) return;
    if (!clickedItem.hasAttribute(selectionTypeAttr)) {
      clickedItem = clickedItem.closest(`[${selectionTypeAttr}="image"]`);
      if (!clickedItem) return;
    }

    // If on non-selected image, select that image based on pressed key
    if (clickedItem.getAttribute(selectedAttr) !== "true") {
      addItem({ type: "image", id: getElementId(clickedItem) }, pressedKeysRef.current);
    }

    const clickedItemRect = clickedItem.getBoundingClientRect()
    const shiftX = e.clientX - clickedItemRect.left;
    const shiftY = e.clientY - clickedItemRect.top;

    setMousePos({
      left: e.clientX + window.scrollX - shiftX,
      top: e.clientY + window.scrollY - shiftY
    });
    setMovingIntoAlbum(null);

    let movedOnce = false;
    const handleMouseMove = (ev: MouseEvent) => {
      if (!draggingMode && !movedOnce) {
        setDraggingMode(true);
        movedOnce = true;
      }
      setMousePos({
        left: ev.clientX + window.scrollX - shiftX,
        top: ev.clientY + window.scrollY - shiftY
      });

      const overItem = document.elementsFromPoint(ev.clientX, ev.clientY).find(
        v => v.getAttribute(selectionTypeAttr) === "album"
      );
      if (overItem === undefined) {
        setMovingIntoAlbum(null);
        return;
      }

      const elemId = getElementId(overItem);
      setMovingIntoAlbum(elemId);
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);

      moveSelectionToAlbum();
      setDraggingMode(false);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [pending, selectingEnabled, draggingMode, setDraggingMode, setMovingIntoAlbum, addItem, formAction]);

  useEffect(() => {
    selectionContainerRef.current?.addEventListener("mousedown", handleMouseDown);
    return () => selectionContainerRef.current?.removeEventListener("mousedown", handleMouseDown);
  }, [handleMouseDown]);

  return (
    <div
      ref={draggingContainerRef}
      style={mousePos}
      className={cn(
        "size-56 cursor-move absolute *:absolute",
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
    modifyItems
  } = useSelectionStore(useShallow((s) => ({
    selectingEnabled: s.selectingEnabled,
    draggingMode: s.draggingMode,
    selectionContainerRef: s.selectionContainerRef,
    modifyItems: s.modifyItems,
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

    modifyItems(selectedAlbumIds, selectedImageIds, pressedKeysRef.current);
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
