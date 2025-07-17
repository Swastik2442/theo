import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

type AlbumId = (typeof albums.$inferSelect)["id"];
type ImageId = (typeof images.$inferSelect)["id"];

export type SelectionState = {
  selectedImages: Set<ImageId>;
  selectedAlbums: Set<AlbumId>;
};
export type RouteActions = {
  initialized: boolean;
  addAlbum: (albumId: AlbumId) => void;
  addImage: (imageId: ImageId) => void;
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
) => createStore<SelectionStore>()((set, get) => ({
  ...initState,
  get initialized() { return (get().selectedImages.size > 0 || get().selectedAlbums.size > 0) },
  addAlbum: (id) => set((s) => ({ selectedAlbums: new Set(s.selectedAlbums).add(id) })),
  addImage: (id) => set((s) => ({ selectedImages: new Set(s.selectedImages).add(id) })),
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
