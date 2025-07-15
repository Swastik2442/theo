import { createStore } from 'zustand/vanilla'

import { albums, images } from '~/server/db/schema';

export type AlbumInfo = Pick<typeof albums.$inferSelect, "id" | "name">;
export type ImageInfo = Pick<typeof images.$inferSelect, "id" | "name">;

export type RouteState = {
  isUnknown: boolean;
  albumInfo: Nullable<AlbumInfo>;
  imageInfo: Nullable<ImageInfo>;
  myAlbums: AlbumInfo[];
  myAlbumImages: ImageInfo[];
};
export type RouteActions = {
  setIsUnknown: (isUnknown: boolean) => void;
  setAlbumInfo: (albumInfo: Nullable<AlbumInfo>) => void;
  setImageInfo: (imageInfo: Nullable<ImageInfo>) => void;
  setMyAlbums: (albums: AlbumInfo[]) => void;
  setMyAlbumImages: (images: ImageInfo[]) => void;
};
export type RouteStore = RouteState & RouteActions;

export const defaultInitState: RouteState = {
  isUnknown: false,
  albumInfo: null,
  imageInfo: null,
  myAlbums: [],
  myAlbumImages: [],
}

export const initRouteStore = (): RouteState => {
  return { ...defaultInitState };
}

export const createRouteStore = (
  initState: RouteState = defaultInitState,
) => {
  return createStore<RouteStore>()((set) => ({
    ...initState,
    setIsUnknown: (isUnknown) => set({ isUnknown }),
    setAlbumInfo: (albumInfo) => set({ albumInfo }),
    setImageInfo: (imageInfo) => set({ imageInfo }),
    setMyAlbums: (albums) => set({ myAlbums: albums }),
    setMyAlbumImages: (images) => set({ myAlbumImages: images })
  }))
}
