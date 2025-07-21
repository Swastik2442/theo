'use client';

import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useRouteStore } from '~/contexts/stores/routeStoreProvider';
import { type ImageInfo, type AlbumInfo } from '~/stores/routeStore';

export function ClientAlbumsAndImagesSync({ albums, images }: { albums: AlbumInfo[], images: ImageInfo[] }) {
  const { setMyAlbums, setMyAlbumImages } = useRouteStore(useShallow((s) => ({ setMyAlbums: s.setMyAlbums, setMyAlbumImages: s.setMyAlbumImages })));

  useEffect(() => {
    setMyAlbums(albums);
    setMyAlbumImages(images);
    return () => setMyAlbumImages([]);
  }, [albums, images, setMyAlbums, setMyAlbumImages]);

  return null;
}

export function ClientImageSync({ imageInfo }: { imageInfo: ImageInfo }) {
  const setImageInfo = useRouteStore(useShallow((s) => s.setImageInfo));

  useEffect(() => {
    setImageInfo(imageInfo);
    return () => setImageInfo(null);
  }, [imageInfo, setImageInfo]);

  return null;
}

export function ClientAlbumSync({ albumInfo, images }: { albumInfo: AlbumInfo, images: ImageInfo[] }) {
  const { setAlbumInfo, setMyAlbumImages } = useRouteStore(useShallow((s) => ({ setAlbumInfo: s.setAlbumInfo, setMyAlbumImages: s.setMyAlbumImages })));

  useEffect(() => {
    setAlbumInfo(albumInfo);
    setMyAlbumImages(images);
    return () => {
      setAlbumInfo(null);
      setMyAlbumImages([]);
    };
  }, [albumInfo, images, setAlbumInfo, setMyAlbumImages]);

  return null;
}
