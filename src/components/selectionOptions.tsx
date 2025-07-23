"use client";

import { useActionState, useEffect, useState } from "react";
import Form from "next/form";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useShallow } from "zustand/react/shallow";
import { Download, Move, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { deleteMultipleAction, moveImagesAction } from "~/server/actions";
import { useRouteStore } from "~/contexts/stores/routeStoreProvider";
import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
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
import { LoadingIcon } from "~/components/ui/icons";
import { downloadAsBlob } from "~/utils/file";

export function StopSelectionButton() {
  const reset = useSelectionStore((s) => s.reset);
  return (
    <Button onClick={reset} type="button" title="Stop Selecting" variant="link" size="icon" className="cursor-pointer size-4">
      <X />
      <span className="sr-only select-none">Stop Selecting</span>
    </Button>
  );
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

  let deletionTitleSpan = "selection", deletionTextSpan = "data", deletionSuccessText = "Selection deleted";
  if (selectedAlbums.size > 0 && selectedImages.size > 0) {
    deletionTitleSpan = deletionTextSpan = `Album${selectedAlbums.size > 1 ? "s" : ""} and Image${selectedImages.size > 1 ? "s" : ""}`;
    deletionSuccessText = `${selectedAlbums.size == 1 ? "An Album" : `${selectedAlbums.size} Albums`} and ${selectedImages.size == 1 ? "an Image" : `${selectedImages.size} Images`} deleted`;
  } else if (selectedAlbums.size > 0) {
    if (selectedAlbums.size === 1) {
      deletionTitleSpan = "Album";
      deletionTextSpan = "Album and remove all the Images in it";
      deletionSuccessText = "Album deleted";
    } else {
      deletionTitleSpan = "Albums";
      deletionTextSpan = "Albums and remove all the Images in them";
      deletionSuccessText = `${selectedAlbums.size} Albums deleted`;
    }
  } else if (selectedImages.size > 0) {
    if (selectedImages.size === 1) {
      deletionTitleSpan = deletionTextSpan = "Image";
      deletionSuccessText = "Image deleted";
    } else {
      deletionTitleSpan = deletionTextSpan = "Images";
      deletionSuccessText = `${selectedImages.size} Images deleted`;
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" title={`Delete ${deletionTitleSpan}`} variant="link" size="icon" className="cursor-pointer size-4">
          <Trash2 />
          <span className="sr-only select-none">Delete {deletionTitleSpan}</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your {deletionTextSpan}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={async () => {
            await deleteMultipleAction(Array.from(selectedImages), Array.from(selectedAlbums));
            toast.info(deletionSuccessText);
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
  const posthog = usePostHog();
  const { selectedAlbums, selectedImages } = useSelectionStore(useShallow((s) => ({
    selectedAlbums: s.selectedAlbums,
    selectedImages: s.selectedImages
  })));
  const [downloading, setDownloading] = useState(false);

  return (
    <Button
      onClick={async () => {
        if (downloading) return;
        try {
          posthog.capture("download_begin");
          setDownloading(true);
          toast(
            (
              <div className="flex gap-2 items-center">
                <LoadingIcon className="size-6" />
                <span className="text-lg">Downloading...</span>
              </div>
            ),
            { id: "download-begin", duration: 60000 }
          );

          await downloadAsBlob("/api/download", {
            method: "POST",
            body: JSON.stringify({
              albums: Array.from(selectedAlbums),
              images: Array.from(selectedImages)
            })
          }, "download.zip", [{ accept: { "application/zip": ['.zip'] } }]);

          posthog.capture("download_complete");
          toast.dismiss("download-begin");
          toast(
            (
              <span className="text-lg">
                Download complete!
              </span>
            ),
            { duration: 5000 }
          );
        } catch (error) {
          posthog.capture("download_error", { error });
          toast.dismiss("download-begin");
          toast.error("Download failed. Please try again later.");
        } finally {
          setDownloading(false);
        }
      }}
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
