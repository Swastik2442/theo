"use client";

import { usePathname } from "next/navigation";

export const useRouteDetails = () => {
  const pathname = usePathname();

  if (pathname.startsWith("/albums/")) {
    const albumID = pathname.split("/")[2]!;
    const numberAlbumID = Number(albumID);
    if (isNaN(numberAlbumID)) {
      return { pathname, albumID: null };
    }
    return { pathname, albumID: numberAlbumID };
  }

  return { pathname, albumID: null };
};
