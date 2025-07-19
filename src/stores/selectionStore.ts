import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];
type SelectionBox = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type SelectionState = {
  selectedImages: Set<ImageId>;
  selectedAlbums: Set<AlbumId>;
  selectionBox: SelectionBox;
  selectionBoxActive: boolean;
};
export type SelectionActions = {
  addAlbum: (albumId: AlbumId) => void;
  addImage: (imageId: ImageId) => void;
  modifyAlbums: (albumIds: AlbumId[]) => void;
  modifyImages: (imageIds: ImageId[]) => void;
  removeAlbum: (albumId: AlbumId) => void;
  removeImage: (imageId: ImageId) => void;
  setSelectionBox: (box: SelectionBox) => void;
  setSelectionBoxActive: (active: boolean) => void;
  reset: () => void;
};
export type SelectionStore = SelectionState & SelectionActions;

export const defaultInitState: SelectionState = {
  selectedImages: new Set(),
  selectedAlbums: new Set(),
  selectionBox: { left: 0, top: 0, width: 0, height: 0 },
  selectionBoxActive: false
}

export const initSelectionStore = (): SelectionState => ({ ...defaultInitState });

export const createSelectionStore = (
  initState: SelectionState = defaultInitState,
) => createStore<SelectionStore>()((set) => ({
  ...initState,
  addAlbum: (id) => set((s) => ({ selectedAlbums: new Set(s.selectedAlbums).add(id) })),
  addImage: (id) => set((s) => ({ selectedImages: new Set(s.selectedImages).add(id) })),
  modifyAlbums: (albumIds) => set(() => ({ selectedAlbums: new Set(albumIds) })),
  modifyImages: (imageIds) => set(() => ({ selectedImages: new Set(imageIds) })),
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
  setSelectionBox: (box) => set(() => ({ selectionBox: box })),
  setSelectionBoxActive: (active) => set(() => ({ selectionBoxActive: active })),
  reset: () => set(() => ({ ...defaultInitState }))
}));
