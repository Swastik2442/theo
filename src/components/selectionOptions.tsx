"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { useShallow } from "zustand/react/shallow";
import { Download, Move, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteMultipleAction, moveImagesAction } from "~/server/actions";
import { useRouteStore } from "~/contexts/stores/routeStoreProvider";
import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
import { useDownloadSelection } from "~/hooks/downloadSelection";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "~/components/ui/alert-dialog";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "~/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select"
import { Label } from "~/components/ui/label";

export function StopSelectionButton() {
  const reset = useSelectionStore((s) => s.reset);
  return (
    <Button onClick={reset} type="button" title="Stop Selecting" variant="link" size="icon" className="cursor-pointer size-4">
      <X />
      <span className="sr-only select-none">Stop Selecting</span>
    </Button>
  );
}

function getDeletionStrings(noOfImages: number, noOfAlbums: number) {
  let title = "selection", text = "data", successText = "Selection deleted";
  if (noOfAlbums > 0 && noOfImages > 0) {
    title = text = `Album${noOfAlbums > 1 ? "s" : ""} and Image${noOfImages > 1 ? "s" : ""}`;
    successText = `${noOfAlbums == 1 ? "An Album" : `${noOfAlbums} Albums`} and ${noOfImages == 1 ? "an Image" : `${noOfImages} Images`} deleted`;
  } else if (noOfAlbums > 0) {
    if (noOfAlbums === 1) {
      title = "Album";
      text = "Album and remove all the Images in it";
      successText = "Album deleted";
    } else {
      title = "Albums";
      text = "Albums and remove all the Images in them";
      successText = `${noOfAlbums} Albums deleted`;
    }
  } else if (noOfImages > 0) {
    if (noOfImages === 1) {
      title = text = "Image";
      successText = "Image deleted";
    } else {
      title = text = "Images";
      successText = `${noOfImages} Images deleted`;
    }
  }
  return { title, text, successText };
}

export function DeleteSelectionButton() {
  const router = useRouter();
  const { selectionMode, selectedAlbums, selectedImages, reset } = useSelectionStore(useShallow((s) => ({
    selectionMode: s.selectedAlbums.size > 0 || s.selectedImages.size > 0,
    selectedAlbums: s.selectedAlbums,
    selectedImages: s.selectedImages,
    reset: s.reset
  })));
  if (!selectionMode) return <></>;

  const {
    title: titleSpan,
    text: textSpan,
    successText
  } = getDeletionStrings(selectedImages.size, selectedAlbums.size);

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" title={`Delete ${titleSpan}`} variant="link" size="icon" className="cursor-pointer size-4">
          <Trash2 />
          <span className="sr-only select-none">Delete {titleSpan}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your {textSpan}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => {
            await deleteMultipleAction(Array.from(selectedImages), Array.from(selectedAlbums));
            toast.info(successText);
            reset();
            router.refresh();
          }}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const initialState = { status: "init" } as const;

export function MoveSelectionButton() {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [state, formAction, pending] = useActionState(moveImagesAction, initialState);

  const { albums, currentAlbumId } = useRouteStore(useShallow((state) => ({
    albums: state.myAlbums,
    currentAlbumId: state.albumInfo?.id ?? null
    // BUG: Can lead to wrong album ID if selected images are not in the current album
  })));
  const [selectedAlbumId, setSelectedAlbumId] = useState(currentAlbumId);
  const selectedImagesIDs = useSelectionStore(useShallow(
    (s) => Array.from(s.selectedImages.values())
  ));
  // NOTE: Combining the subscriptions causes useShallow to not work correctly
  const reset = useSelectionStore((s) => s.reset);

  useEffect(() => {
    if (state.status == 'error') {
      toast[state.status](state.message, {
        duration: 5000,
        description: state.data,
      });
    } else if (state.status == 'success') {
      router.refresh();
      setDialogOpen(false);
      reset();
      toast.success(`${selectedImagesIDs.length} Images moved${selectedAlbumId === null ? '' : ` to ${selectedAlbumId}`}`);
    }
  }, [state]);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button type="button" title="Move Images" variant="link" size="icon" className="cursor-pointer size-4">
          <Move />
          <span className="sr-only select-none">Move Images</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Move Images</DialogTitle>
            <DialogDescription>Select an album to move the images to.</DialogDescription>
          </DialogHeader>
        <Form action={formAction}>
          <div className="grid gap-4 pb-4">
            <div className="grid gap-3">
              <input type="hidden" name="imageIds" value={JSON.stringify(selectedImagesIDs)} />
              <Select
                name="albumId"
                defaultValue={JSON.stringify(currentAlbumId)}
                value={JSON.stringify(selectedAlbumId)}
                onValueChange={(value) => setSelectedAlbumId(JSON.parse(value))}
              >
                <Label htmlFor="albumId">Album</Label>
                <SelectTrigger title="Select an album" className="w-full">
                  <SelectValue placeholder="Select an album" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={JSON.stringify(null)}><strong>No Album</strong></SelectItem>
                  {albums.map(album => (
                    <SelectItem key={`move-to-album-${album.id}`} value={JSON.stringify(album.id)}>
                      {album.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" title="Cancel" disabled={pending}>Cancel</Button>
            </DialogClose>
            <Button type="submit" title="Move Images" disabled={pending}>Move Images</Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function DownloadSelectionButton() {
  const { downloading, downloadSelection } = useDownloadSelection();
  return (
    <Button
      onClick={downloadSelection}
      disabled={downloading}
      className="cursor-pointer size-4"
      title="Download Selection"
      variant="link"
      size="icon"
      type="button"
    >
      <Download />
      <span className="sr-only select-none">Download Selection</span>
    </Button>
  );
}
