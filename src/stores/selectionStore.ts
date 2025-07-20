import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';
import {
  getElementId,
  getElementType,
  selectionIdAttr,
  selectionTypeAttr
} from '~/utils/selection';
import { isMacOS } from '~/utils/platform';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];
type SelectedItem =
  | { id: ImageId; type: "image"; }
  | { id: AlbumId; type: "album"; };
type ModifierKeys = Pick<KeyboardEvent, "ctrlKey" | "shiftKey" | "metaKey">;

export type SelectionState = {
  /** Set of selected images, where key is the image ID */
  selectedImages: Set<ImageId>;
  /** Set of selected albums, where key is the album ID */
  selectedAlbums: Set<AlbumId>;
  /** Last selected item, used for shift key based selection */
  lastSelectedItem: Nullable<SelectedItem>;
  /** Reference to the container element where selection is applied */
  containerRef: React.RefObject<Nullable<HTMLDivElement>>;
};
export type SelectionActions = {
  /** Adds an item to the selection, based on pressed keys */
  addItem: (item: SelectedItem, pressedKeys: ModifierKeys) => void;
  /** Keeps/Removes an item from the selection, based on pressed keys */
  removeItem: (item: SelectedItem, pressedKeys: ModifierKeys) => void;
  /** Modifies the selection of albums */
  modifyAlbums: (albumIds: AlbumId[] | Set<ImageId>) => void;
  /** Modifies the selection of images */
  modifyImages: (imageIds: ImageId[] | Set<AlbumId>) => void;
  /** Sets the last selected item */
  setLastSelectedItem: (item: SelectedItem) => void;
  /** Resets the selection state */
  reset: () => void;
};
export type SelectionStore = SelectionState & SelectionActions;

export const defaultInitState: SelectionState = {
  selectedImages: new Set(),
  selectedAlbums: new Set(),
  lastSelectedItem: null,
  containerRef: { current: null }
};

export const initSelectionStore = (): SelectionState => ({ ...defaultInitState });

export const createSelectionStore = (
  initState: SelectionState = defaultInitState,
) => createStore<SelectionStore>()((set) => ({
  ...initState,
  addItem: (item, pressedKeys) => set((s) => {
    // if shift pressed,
    if (pressedKeys.shiftKey) {
      const containerDiv = s.containerRef.current;
      if (!containerDiv) throw new Error("Container ref is not set");
      const elements = Array.from(containerDiv.querySelectorAll(`*[${selectionIdAttr}][${selectionTypeAttr}]`)).map(
        el => ({ id: getElementId(el), type: getElementType(el) })
      );
      if (elements.length === 0) throw new Error("No selectable elements found in container");

      const endingAt = elements.findIndex((el) => el.id === item.id);
      if (endingAt === -1) throw new Error("Item not found in container");

      // // if last selected item is not known, select all items from starting to current item
      // // if last selected item is known, select all items between last selected item and current item
      let startingFrom: number = 0;
      const lastSelectedItem = s.lastSelectedItem;
      if (lastSelectedItem) {
        const check = elements.findIndex((el) => el.id === lastSelectedItem.id);
        if (check != -1) startingFrom = check;
      }

      const selectedElements = elements.slice(
        Math.min(startingFrom, endingAt),
        Math.max(startingFrom, endingAt) + 1
      );
      const selectedAlbumIds = selectedElements.filter(el => el.type === "album").map(el => el.id);
      const selectedImageIds = selectedElements.filter(el => el.type === "image").map(el => el.id);

      return {
        selectedAlbums: new Set(selectedAlbumIds),
        selectedImages: new Set(selectedImageIds),
        lastSelectedItem: { id: item.id, type: item.type }
      };
    }

    // if ctrl/meta pressed, add item to selection
    if (isMacOS() ? pressedKeys.metaKey : pressedKeys.ctrlKey) {
      switch (item.type) {
        case "album":
          return { selectedAlbums: new Set(s.selectedAlbums).add(item.id), lastSelectedItem: { id: item.id, type: "album" } };
        case "image":
          return { selectedImages: new Set(s.selectedImages).add(item.id), lastSelectedItem: { id: item.id, type: "image" } };
      }
    }

    // if no modifier, select item only
    switch (item.type) {
      case "album":
        return { selectedAlbums: new Set([item.id]), lastSelectedItem: { id: item.id, type: "album" } };
      case "image":
        return { selectedImages: new Set([item.id]), lastSelectedItem: { id: item.id, type: "image" } };
    }
  }),
  removeItem: (item, pressedKeys) => set((s) => {
    // if shift pressed,
    if (pressedKeys.shiftKey) {
      // // if last selected item is not known, NOT POSSIBLE
      const lastSelectedItem = s.lastSelectedItem;
      if (!lastSelectedItem) throw new Error("Last selected item is not set");

      const containerDiv = s.containerRef.current;
      if (!containerDiv) throw new Error("Container ref is not set");
      const elements = Array.from(containerDiv.querySelectorAll(`*[${selectionIdAttr}][${selectionTypeAttr}]`)).map(
        el => ({ id: getElementId(el), type: getElementType(el) })
      );
      if (elements.length === 0) throw new Error("No selectable elements found in container");

      // // if last selected item is known, select all items between last selected item and current item
      let startingFrom: number = -1, endingAt: number = -1;
      for (let idx = 0; idx < elements.length; idx++) {
        const id = elements[idx]!.id;
        if (id === lastSelectedItem.id) startingFrom = idx;
        if (id === item.id) endingAt = idx;
        if (-1 != startingFrom  && -1 != endingAt ) break;
      }
      if (-1 == startingFrom  || -1 == endingAt ) {
        throw new Error("Item not found in container");
      }

      const selectedElements = elements.slice(
        Math.min(startingFrom, endingAt),
        Math.max(startingFrom, endingAt) + 1
      );
      const selectedAlbumIds = selectedElements.filter(el => el.type === "album").map(el => el.id);
      const selectedImageIds = selectedElements.filter(el => el.type === "image").map(el => el.id);

      return {
        selectedAlbums: new Set(selectedAlbumIds),
        selectedImages: new Set(selectedImageIds),
        lastSelectedItem: { id: item.id, type: item.type }
      };
    }

    // if no modifier or ctrl/meta, remove item from selection
    switch (item.type) {
      case "album":
        if (!s.selectedAlbums.has(item.id)) {
          throw new Error(`Album with id ${item.id} is not selected`);
        }
        const updatedAlbums = new Set(s.selectedAlbums);
        updatedAlbums.delete(item.id);
        return { selectedAlbums: updatedAlbums, lastSelectedItem: { id: item.id, type: "album" } };
      case "image":
        if (!s.selectedImages.has(item.id)) {
          throw new Error(`Image with id ${item.id} is not selected`);
        }
        const updatedImages = new Set(s.selectedImages);
        updatedImages.delete(item.id);
        return { selectedImages: updatedImages, lastSelectedItem: { id: item.id, type: "image" } };
      }
    }),
  modifyAlbums: (albumIds) => set(() => ({ selectedAlbums: Array.isArray(albumIds) ? new Set(albumIds) : albumIds })),
  modifyImages: (imageIds) => set(() => ({ selectedImages: Array.isArray(imageIds) ? new Set(imageIds) : imageIds })),
  setLastSelectedItem: (item: SelectedItem) => set((s) => {
    switch (item.type) {
      case "album":
        if (s.selectedAlbums.has(item.id)) return { lastSelectedItem: { id: item.id, type: "album" } };
        throw new Error(`Album with id ${item.id} is not selected`);
      case "image":
        if (s.selectedImages.has(item.id)) return { lastSelectedItem: { id: item.id, type: "image" } };
        throw new Error(`Image with id ${item.id} is not selected`);
    }
  }),
  reset: () => set(() => ({ ...defaultInitState }))
}));
