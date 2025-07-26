"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { useRouteStore } from "~/contexts/stores/routeStoreProvider";
import { useUploadThing } from "~/hooks/uploadThing";
import { LoadingIcon, UploadIcon } from "~/components/ui/icons";
import { isAnyDialogOpen } from "~/utils/dialog";

/**
 * A simple Modal Component
 *
 * NOTE: Will be added to DOM but will not be visible if another Dialog is open.
 * Should be re-added to DOM after other open Dialogs are closed.
 */
function Modal({ children }: { children: React.ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (!isAnyDialogOpen() && !dialogRef.current?.open) {
      dialogRef.current?.showModal();
    }
  }, []);

  return (
    <dialog ref={dialogRef} className="w-screen h-screen bg-zinc-500/50 border-4 border-accent-foreground">
      {children}
    </dialog>
  );
}

type UTArgs = Parameters<typeof useUploadThing>;
type UTInput = Parameters<ReturnType<typeof useUploadThing>['startUpload']>[1];

const useUploadThingInputProps = (input: UTInput, ...args: UTArgs) => {
  const $ut = useUploadThing(...args);
  const [draggedOver, setDraggedOver] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onDragOver = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if ($ut.isUploading) return;
    if (!draggedOver) setDraggedOver(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (draggedOver) setDraggedOver(false);
    }, 100);
  };

  const onDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if ($ut.isUploading) return;

    let selectedFiles: File[];
    if (e.dataTransfer.items) {
      selectedFiles = [];
      Array.from(e.dataTransfer.items).forEach((item) => {
        if (item.kind === "file" && item.type.match("^image/")) {
          const file = item.getAsFile();
          if (file) selectedFiles.push(file);
        }
      });
    } else {
      selectedFiles = Array.from(e.dataTransfer.files).filter((file) => file.type.match("^image/"));
    }

    await $ut.startUpload(selectedFiles, input);

    // const result = await $ut.startUpload(selectedFiles, input);
    // console.log("uploaded files", result);
    if (draggedOver) setDraggedOver(false);
  };

  return {
    containerProps: { onDrop, onDragOver },
    isUploading: $ut.isUploading,
    draggedOver
  };
};

const LoadingTextToast = ({ text }: { text: string; }) => (
  <div className="flex gap-2 items-center">
    <LoadingIcon className="size-6" />
    <span className="text-lg">{text}</span>
  </div>
);

const uploadToastId = "dropzone_upload_begin";
export function SimpleUploadDropzone({ children }: { children: React.ReactNode; }) {
  const router = useRouter();
  const posthog = usePostHog();
  const albumID = useRouteStore(useShallow((s) => s.albumInfo?.id ?? null));

  const { containerProps, isUploading, draggedOver } = useUploadThingInputProps(
    { albumID },
    "imageUploader",
    {
      onBeforeUploadBegin(files) {
        toast(
          <LoadingTextToast text="Starting Upload..." />,
          { id: uploadToastId, duration: 60000 }
        );
        return files;
      },
      onUploadBegin() {
        posthog.capture("upload_begin");
        toast(
          <LoadingTextToast text="Uploading 0%" />,
          { id: uploadToastId }
        );
      },
      onUploadProgress(p) {
        toast(
          <LoadingTextToast text={`Uploading ${p}%`} />,
          { id: uploadToastId }
        );
      },
      onUploadError(error) {
        posthog.capture("upload_error", { error });
        toast.dismiss(uploadToastId);
        toast.error("Upload failed. Please try again later.");
      },
      onClientUploadComplete() {
        posthog.capture("upload_complete");
        toast.dismiss(uploadToastId);
        toast.success(
          (
            <span className="text-lg">
              Upload complete!
            </span>
          ),
          { duration: 5000 }
        );
        router.refresh();
      }
    }
  );

  return (
    <div className="flex flex-col flex-1" {...containerProps}>
      {children}
      {!isUploading && draggedOver && (
        <Modal>
          <div className="flex flex-col gap-2 justify-center items-center size-full text-accent-foreground select-none">
            <UploadIcon className="size-6 fill-zinc-500/50" />
            <span>Upload Image(s)</span>
          </div>
        </Modal>
      )}
    </div>
  );
}
