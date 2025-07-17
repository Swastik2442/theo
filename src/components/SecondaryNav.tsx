"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useShallow } from 'zustand/react/shallow'

import { useMediaQuery } from "~/hooks/mediaQuery"
import { useRouteStore } from "~/contexts/routeStoreProvider";
import { useSelectionStore } from "~/contexts/selectionStoreProvider";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
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
  DrawerTrigger
} from "~/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "~/components/ui/dropdown-menu";
import {
  CreateAlbumButton,
  UpdateAlbumButton,
  DeleteAlbumButton
} from '~/components/albumOptions';
import {
  DeleteSelectionButton,
  DownloadSelectionButton,
  MoveSelectionButton,
  StopSelectionButton
} from "~/components/selectionOptions";

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
            className="flex items-center whitespace-nowrap"
            aria-label="Toggle menu"
          >
            {name}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {items.map((item) => (
              <DropdownMenuItem key={`breadcrumb-dropdown-item[${item.href}]`}>
                <Link href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger
            className="flex items-center whitespace-nowrap"
            aria-label="Toggle Menu"
          >
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
              {items.map((item) => (
                <Link
                  key={`breadcrumb-drawer-item[${item.href}]`}
                  href={item.href}
                  onClick={() => setOpen(false)}
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

  const { albumInfo, imageInfo, myAlbums, myAlbumImages } = useRouteStore(useShallow((state) => ({
    albumInfo: state.albumInfo,
    imageInfo: state.imageInfo,
    myAlbums: state.myAlbums,
    myAlbumImages: state.myAlbumImages
  })));

  // There must be a better way to do this
  let collection1Name: string | null = null;
  if (albumInfo == null && imageInfo == null) {
    collection1Name = "Home";
  } else if (albumInfo != null) {
    collection1Name = "Albums";
  } else if (imageInfo != null) {
    collection1Name = "Images";
  }

  let item1Name: string | null = null;
  if (collection1Name === "Home") {
    item1Name = null;
  } else if (collection1Name === "Albums") {
    item1Name = albumInfo!.name;
  } else if (collection1Name === "Images") {
    item1Name = imageInfo!.name;
  }

  let collection2Name: string | null = null;
  if (collection1Name === "Albums" && imageInfo != null) {
    collection2Name = "Images";
  }

  let item2Name: string | null = null;
  if (collection2Name === "Images") {
    item2Name = imageInfo?.name ?? null;
  }

  const item1Items =
    collection1Name === "Albums"
    ? myAlbums.map((album) => ({ label: album.name, href: `/albums/${album.id}` }))
    : collection1Name === "Images"
    ? myAlbumImages.map((image) => ({ label: image.name, href: `/images/${image.id}` }))
    : null;
  const item2Items =
    collection2Name === "Images"
    ? myAlbumImages.map((image) => ({ label: image.name, href: `/images/${image.id}` }))
    : null;

  return (
    <Breadcrumb className="select-none overflow-x-auto">
      <BreadcrumbList className="flex flex-nowrap text-gray-500">
        {collection1Name != null && (collection1Name == "Home" ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="cursor-default text-gray-500">Home</BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <NavBreadcrumbItem name={collection1Name} items={[{ label: "Home", href: "/" }]} open={collection1Open} setOpen={setCollection1Open} isDesktop={isDesktop} />
        ))}
        {item1Name != null && (<>
          <BreadcrumbSeparator />
          <NavBreadcrumbItem name={item1Name} items={item1Items!} open={item1Open} setOpen={setItem1Open} isDesktop={isDesktop} />
        </>)}
        {collection2Name != null && (<>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="cursor-default text-gray-500">{collection2Name}</BreadcrumbPage>
          </BreadcrumbItem>
        </>)}
        {item2Name != null && (<>
          <BreadcrumbSeparator />
          <NavBreadcrumbItem name={item2Name} items={item2Items!} open={item2Open} setOpen={setItem2Open} isDesktop={isDesktop} />
        </>)}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

function NavBreadcrumbOptions() {
  const pathName = usePathname();
  const albumInfo = useRouteStore(useShallow((state) => state.albumInfo));

  return (
    <div className="flex items-center justify-center gap-2">
      {/^\/(?:\?.*)?$/gm.test(pathName) && <CreateAlbumButton />}
      {/^\/albums\/\d+(?:\?.*)?$/gm.test(pathName) && albumInfo != null && (<>
        <UpdateAlbumButton albumId={albumInfo.id} albumInfo={albumInfo} />
        <DeleteAlbumButton albumId={albumInfo.id} />
      </>)}
    </div>
  );
}

function NavSelectionInfo() {
  const { selectedAlbumsSize, selectedImagesSize } = useSelectionStore(useShallow((state) => ({
    selectedAlbumsSize: state.selectedAlbums.size,
    selectedImagesSize: state.selectedImages.size
  })));

  return (
    <p className="select-none overflow-x-auto text-sm text-gray-500">
      <span>Selected </span>
      {selectedAlbumsSize == 0 && selectedImagesSize == 0 && <span> nothing</span>}
      {selectedAlbumsSize > 0 && (
        <span>{selectedAlbumsSize} Album{selectedAlbumsSize > 1 ? "s" : ""} </span>
      )}
      {selectedAlbumsSize > 0 && selectedImagesSize > 0 && <span>and </span>}
      {selectedImagesSize > 0 && (
        <span>{selectedImagesSize} Image{selectedImagesSize > 1 ? "s" : ""}</span>
      )}
    </p>
  );
}

function NavSelectionOptions() {
  const onlyImagesSelected = useSelectionStore(useShallow(
    (state) => state.selectedAlbums.size == 0 && state.selectedImages.size > 0)
  );
  return (
    <div className="flex items-center justify-center gap-2">
      <DownloadSelectionButton />
      {onlyImagesSelected && <MoveSelectionButton />}
      <DeleteSelectionButton />
      <StopSelectionButton />
    </div>
  );
}

export function SecondaryNav() {
  const pathName = usePathname();
  const isUnknown = useRouteStore((state) => state.isUnknown);
  const selectionMode = useSelectionStore((state) => state.selectedAlbums.size > 0 || state.selectedImages.size > 0);

  // Renders for these paths only: /, /albums/:id, /images/:id
  return !isUnknown && /^\/(?:|albums\/\d+|images\/\d+)(?:\?.*)?$/gm.test(pathName) && (
    <div className="flex items-center justify-between px-4 py-1 gap-2 border-b border-t hover:border-accent print:hidden">
      {selectionMode ? (<>
        <NavSelectionInfo />
        <NavSelectionOptions />
      </>) : (<>
        <NavBreadcrumb />
        <NavBreadcrumbOptions />
      </>)}
    </div>
  );
}

export default SecondaryNav;
