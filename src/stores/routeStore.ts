import { create } from 'zustand';

import { albums, images } from '~/server/db/schema';

export type AlbumInfo = Pick<typeof albums.$inferSelect, "id" | "name">;
export type ImageInfo = Pick<typeof images.$inferSelect, "id" | "name" | "key" | "url" | "albumID">;

interface RouteStore {
  albumInfo: Nullable<AlbumInfo>;
  imageInfo: Nullable<ImageInfo>;
  setAlbumInfo: (albumInfo: Nullable<AlbumInfo>) => void;
  setImageInfo: (imageInfo: Nullable<ImageInfo>) => void;
};

export const useRouteStore = create<RouteStore>((set) => ({
  albumInfo: null,
  imageInfo: null,
  setAlbumInfo: (albumInfo) => set({ albumInfo }),
  setImageInfo: (imageInfo) => set({ imageInfo })
}));
