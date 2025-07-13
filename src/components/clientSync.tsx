'use client';

import { useEffect } from 'react';
import { useRouteStore, type ImageInfo, type AlbumInfo } from '~/stores/routeStore';

export function ClientImageSync({ imageInfo }: { imageInfo: ImageInfo }) {
  const setImageInfo = useRouteStore((s) => s.setImageInfo);

  useEffect(() => {
    setImageInfo(imageInfo);
    return () => setImageInfo(null);
  }, [imageInfo, setImageInfo]);

  return null;
}

export function ClientAlbumSync({ albumInfo }: { albumInfo: AlbumInfo }) {
  const setAlbumInfo = useRouteStore((s) => s.setAlbumInfo);

  useEffect(() => {
    setAlbumInfo(albumInfo);
    return () => setAlbumInfo(null);
  }, [albumInfo, setAlbumInfo]);

  return null;
}
