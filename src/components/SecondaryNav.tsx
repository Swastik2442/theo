"use client";

import { useState } from "react";
import Link from "next/link";
import { useShallow } from 'zustand/react/shallow'

import { useMediaQuery } from "~/hooks/mediaQuery"
import { useRouteStore } from "~/contexts/routeStoreProvider";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { CreateAlbumButton } from './createAlbum';

// Possible Routes:
// Home,
// Images -> ImageName,
// Albums -> AlbumName,
// Albums -> AlbumName -> Images -> ImageName

function NavBreadcrumbItem({
  name, items, open, setOpen, isDesktop
} : {
  name: string;
  items: { label: string; href: string; }[];
  open: boolean;
  setOpen: (open: boolean) => void;
  isDesktop: boolean;
}) {
  return (
    <BreadcrumbItem>
      {isDesktop ? (
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger
            className="flex items-center"
            aria-label="Toggle menu"
          >{name}</DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {items.map((item, index) => (
              <DropdownMenuItem key={index}>
                <Link href={item.href ? item.href : "#"}>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger aria-label="Toggle Menu">
            {name}
          </DrawerTrigger>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Navigate to</DrawerTitle>
              <DrawerDescription>
                Select a page to navigate to.
              </DrawerDescription>
            </DrawerHeader>
            <div className="grid gap-1 px-4">
              {items.map((item, index) => (
                <Link
                  key={index}
                  href={item.href ? item.href : "#"}
                  className="py-1 text-sm"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <DrawerFooter className="pt-4">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </BreadcrumbItem>
  );
}

function NavBreadcrumb() {
  const [collection1Open, setCollection1Open] = useState(false);
  const [item1Open, setItem1Open] = useState(false);
  const [item2Open, setItem2Open] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { isUnknown, albumInfo, imageInfo, myAlbums, myAlbumImages } = useRouteStore(useShallow((state) => ({
    isUnknown: state.isUnknown,
    albumInfo: state.albumInfo,
    imageInfo: state.imageInfo,
    myAlbums: state.myAlbums,
    myAlbumImages: state.myAlbumImages
  })));

  // this is absolutely not even the worst way to do this, but it works for now :)
  const collection1Name = (!isUnknown && albumInfo == null && imageInfo == null) ? "Home" : (albumInfo != null ? "Albums" : (imageInfo != null ? "Images" : null));
  const item1Name = collection1Name == "Home" ? null : (collection1Name == "Albums" ? albumInfo!.name : (collection1Name == "Images" ? imageInfo!.name : null));
  const collection2Name = (collection1Name != "Albums" || imageInfo == null) ? null : "Images";
  const item2Name = collection2Name == null ? null : (collection2Name == "Images" ? imageInfo?.name ?? null : null);

  const collection1Items = [{ label: "Home", href: "/" }];
  const item1Items = (collection1Name == "Albums" ? myAlbums.map((album) => ({ label: album.name, href: `/albums/${album.id}` })) : (collection1Name == "Images" ? myAlbumImages.map((image) => ({ label: image.name, href: `/images/${image.id}` })) : null));
  const item2Items = collection2Name == "Images" ? myAlbumImages.map((image) => ({ label: image.name, href: `/images/${image.id}` })) : null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {collection1Name != null && (collection1Name == "Home" ? (
          <BreadcrumbItem><BreadcrumbPage className="cursor-default">Home</BreadcrumbPage></BreadcrumbItem>
        ) : (
          <NavBreadcrumbItem name={collection1Name} items={collection1Items} open={collection1Open} setOpen={setCollection1Open} isDesktop={isDesktop} />
        ))}
        {item1Name != null && (<>
          <BreadcrumbSeparator />
          <NavBreadcrumbItem name={item1Name} items={item1Items!} open={item1Open} setOpen={setItem1Open} isDesktop={isDesktop} />
        </>)}
        {collection2Name != null && (<>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>{collection2Name}</BreadcrumbPage></BreadcrumbItem>
        </>)}
        {item2Name != null && (<>
          <BreadcrumbSeparator />
          <NavBreadcrumbItem name={item2Name} items={item2Items!} open={item2Open} setOpen={setItem2Open} isDesktop={isDesktop} />
        </>)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function NavOptions() {
  const { isUnknown, albumInfo, imageInfo } = useRouteStore(useShallow((state) => ({
    isUnknown: state.isUnknown,
    albumInfo: state.albumInfo,
    imageInfo: state.imageInfo
  })));

  return (
    <div className="flex items-center justify-center gap-2">
      {!isUnknown && albumInfo == null && imageInfo == null && <CreateAlbumButton />}
    </div>
  );
}

export function SecondaryNav() {
  return (
    <div className="flex items-center justify-between px-4 py-1 border border-red-500">
        <NavBreadcrumb />
        <NavOptions />
    </div>
  );
}

export default SecondaryNav;
