import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];
type LastSelectedItem =
  | { id: ImageId; type: "image"; }
  | { id: AlbumId; type: "album"; };

export type SelectionState = {
  selectedImages: Set<ImageId>;
  selectedAlbums: Set<AlbumId>;
  lastSelectedItem: Nullable<LastSelectedItem>;
  containerRef: React.RefObject<Nullable<HTMLElement>>;
};
export type SelectionActions = {
  addAlbum: (albumId: AlbumId) => void;
  addImage: (imageId: ImageId) => void;
  modifyAlbums: (albumIds: AlbumId[] | Set<ImageId>) => void;
  modifyImages: (imageIds: ImageId[] | Set<AlbumId>) => void;
  removeAlbum: (albumId: AlbumId) => void;
  removeImage: (imageId: ImageId) => void;
  setLastSelectedItem: (item: LastSelectedItem) => void;
  setContainerRef: (ref: React.RefObject<Nullable<HTMLElement>>) => void;
  reset: () => void;
};
export type SelectionStore = SelectionState & SelectionActions;

export const defaultInitState: SelectionState = {
  selectedImages: new Set(),
  selectedAlbums: new Set(),
  lastSelectedItem: null,
  containerRef: { current: null }
}

export const initSelectionStore = (): SelectionState => ({ ...defaultInitState });

export const createSelectionStore = (
  initState: SelectionState = defaultInitState,
) => createStore<SelectionStore>()((set, get) => ({
  ...initState,
  addAlbum: (id) => set((s) => ({ selectedAlbums: new Set(s.selectedAlbums).add(id), lastSelectedItem: { id, type: "album" } })),
  addImage: (id) => set((s) => ({ selectedImages: new Set(s.selectedImages).add(id), lastSelectedItem: { id, type: "image" } })),
  modifyAlbums: (albumIds) => set(() => ({ selectedAlbums: Array.isArray(albumIds) ? new Set(albumIds) : albumIds })),
  modifyImages: (imageIds) => set(() => ({ selectedImages: Array.isArray(imageIds) ? new Set(imageIds) : imageIds })),
  removeAlbum: (id) => {set((s) => {
    const next = new Set(s.selectedAlbums);
    next.delete(id);
    return { selectedAlbums: next };
  })},
  removeImage: (id) => set((s) => {
    const next = new Set(s.selectedImages);
    next.delete(id);
    return { selectedImages: next };
  }),
  setLastSelectedItem: (item: LastSelectedItem) => set(() => {
    switch (item.type) {
      case "album":
        if (get().selectedAlbums.has(item.id)) return { lastSelectedItem: { id: item.id, type: "album" } };
        throw new Error(`Album with id ${item.id} is not selected`);
      case "image":
        if (get().selectedImages.has(item.id)) return { lastSelectedItem: { id: item.id, type: "image" } };
        throw new Error(`Image with id ${item.id} is not selected`);
      default:
        throw new Error(`Invalid item type: ${(item as any).type}`);
    }
  }),
  setContainerRef: (ref) => set(() => ({ containerRef: ref })),
  reset: () => set(() => ({ ...defaultInitState }))
}));
