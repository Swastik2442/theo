import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];

export type SelectionState = {
  selectedImages: ImageId[];
  selectedAlbums: AlbumId[];
};
export type RouteActions = {
  addAlbum: (albumId: AlbumId | AlbumId[]) => void;
  addImage: (imageId: ImageId | ImageId[]) => void;
  removeAlbum: (albumId: AlbumId | AlbumId[]) => void;
  removeImage: (imageId: ImageId | ImageId[]) => void;
  reset: () => void;
};
export type SelectionStore = SelectionState & RouteActions;

export const defaultInitState: SelectionState = {
  selectedImages: [],
  selectedAlbums: []
}

export const initSelectionStore = (): SelectionState => {
  return { ...defaultInitState };
}

export const createSelectionStore = (
  initState: SelectionState = defaultInitState,
) => {
  return createStore<SelectionStore>()((set) => ({
    ...initState,
    addAlbum: (id) => set((s) => ({
        selectedAlbums: [...s.selectedAlbums, ...(Array.isArray(id) ? id : [id])]
    })),
    addImage: (id) => set((s) => ({
        selectedImages: [...s.selectedImages, ...(Array.isArray(id) ? id : [id])]
    })),
    removeAlbum: (id) => set((s) => ({
        selectedAlbums: s.selectedAlbums.filter(a => Array.isArray(id) ? !id.includes(a) : a !== id)
    })),
    removeImage: (id) => set((s) => ({
        selectedImages: s.selectedImages.filter(i => Array.isArray(id) ? !id.includes(i) : i !== id)
    })),
    reset: () => set(() => ({ ...defaultInitState }))
  }));
}
