import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];


export type SelectionState = {
  selectedImages: Set<ImageId>;
  selectedAlbums: Set<AlbumId>;
};
export type SelectionActions = {
  addAlbum: (albumId: AlbumId) => void;
  addImage: (imageId: ImageId) => void;
  modifyAlbums: (albumIds: AlbumId[] | Set<ImageId>) => void;
  modifyImages: (imageIds: ImageId[] | Set<AlbumId>) => void;
  removeAlbum: (albumId: AlbumId) => void;
  removeImage: (imageId: ImageId) => void;
  reset: () => void;
};
export type SelectionStore = SelectionState & SelectionActions;

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
  reset: () => set(() => ({ ...defaultInitState }))
}));
