"use client";

import { useRouter } from "next/navigation";
import { usePostHog } from "posthog-js/react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { useRouteStore } from "~/contexts/stores/routeStoreProvider";
import { useUploadThing } from "~/hooks/uploadThing";
import { LoadingIcon, UploadIcon } from "~/components/ui/icons";

type UTArgs = Parameters<typeof useUploadThing>;
type UTInput = Parameters<ReturnType<typeof useUploadThing>['startUpload']>[1];

const useUploadThingInputProps = (input: UTInput, ...args: UTArgs) => {
  const $ut = useUploadThing(...args);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    await $ut.startUpload(selectedFiles, input);

    // const result = await $ut.startUpload(selectedFiles, input);
    // console.log("uploaded files", result);
  };

  return {
    inputProps: {
      onChange,
      multiple: ($ut.routeConfig?.image?.maxFileCount ?? 1) > 1,
      accept: "image/*",
    },
    isUploading: $ut.isUploading,
  };
};

const LoadingTextToast = ({ text }: { text: string; }) => (
  <div className="flex gap-2 items-center">
    <LoadingIcon className="size-6" />
    <span className="text-lg">{text}</span>
  </div>
);

const uploadToastId = "button_upload_begin";
export function SimpleUploadButton() {
  const router = useRouter();
  const posthog = usePostHog();
  const albumID = useRouteStore(useShallow((s) => s.albumInfo?.id ?? null));

  const { inputProps, isUploading } = useUploadThingInputProps(
    { albumID },
    "imageUploader",
    {
      onBeforeUploadBegin(files) {
        toast(
          <LoadingTextToast text="Starting Upload" />,
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
        toast(
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
    <label className="cursor-pointer" title={isUploading ? "Uploading..." : "Upload File(s)"}>
      {isUploading ? <LoadingIcon className="size-6" /> : <>
        <UploadIcon className="size-6 fill-background" />
        <input type="file" className="sr-only" {...inputProps} />
      </>}
    </label>
  );
}
