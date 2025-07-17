import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];

export type SelectionState = {
  selectedImages: Set<ImageId>;
  selectedAlbums: Set<AlbumId>;
};
export type RouteActions = {
  addAlbum: (albumId: AlbumId) => void;
  addImage: (imageId: ImageId) => void;
  modifyAlbums: (albumIds: AlbumId[]) => void;
  modifyImages: (imageIds: ImageId[]) => void;
  removeAlbum: (albumId: AlbumId) => void;
  removeImage: (imageId: ImageId) => void;
  reset: () => void;
};
export type SelectionStore = SelectionState & RouteActions;

export const defaultInitState: SelectionState = {
  selectedImages: new Set(),
  selectedAlbums: new Set()
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
  reset: () => set(() => ({ ...defaultInitState }))
}));
