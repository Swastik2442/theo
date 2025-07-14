'use client';

import { useEffect } from 'react';
import { useRouteStore } from '~/contexts/routeStoreProvider';
import { type ImageInfo, type AlbumInfo } from '~/stores/routeStore';

export function ClientImageSync({ imageInfo }: { imageInfo: ImageInfo }) {
  const setImageInfo = useRouteStore((s) => s.setImageInfo);

  useEffect(() => {
    setImageInfo(imageInfo);
    return () => setImageInfo(null);
  }, [imageInfo, setImageInfo]);

  return null;
}

export function ClientAlbumSync({ albumInfo, images }: { albumInfo: AlbumInfo, images: ImageInfo[] }) {
  const { setAlbumInfo, setMyAlbumImages } = useRouteStore((s) => ({ setAlbumInfo: s.setAlbumInfo, setMyAlbumImages: s.setMyAlbumImages }));

  useEffect(() => {
    setAlbumInfo(albumInfo);
    setMyAlbumImages(images);
    return () => {
      setAlbumInfo(null);
      setMyAlbumImages([]);
    };
  }, [albumInfo, setAlbumInfo]);

  return null;
}
