"use client";

import { useState } from "react";
import { usePostHog } from "posthog-js/react";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";

import { useSelectionStore } from "~/contexts/stores/selectionStoreProvider";
import { LoadingIcon } from "~/components/ui/icons";
import { downloadAsBlob } from "~/utils/file";

export function useDownloadSelection() {
  const posthog = usePostHog();
  const { selectedAlbums, selectedImages } = useSelectionStore(useShallow((s) => ({
    selectedAlbums: s.selectedAlbums,
    selectedImages: s.selectedImages
  })));
  const [downloading, setDownloading] = useState(false);

  const downloadSelection = async () => {
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

      const downloadSuccess = await downloadAsBlob("/api/downloadthing", {
        method: "POST",
        body: JSON.stringify({
          albums: Array.from(selectedAlbums),
          images: Array.from(selectedImages)
        })
      }, "download.zip", [{ accept: { "application/zip": ['.zip'] } }]);

      posthog.capture("download_complete");
      toast.dismiss("download-begin");
      if (downloadSuccess) toast((
        <span className="text-lg">
          Download complete!
        </span>
      ), { duration: 5000 });

    } catch (error) {
      posthog.capture("download_error", { error });
      toast.dismiss("download-begin");
      toast.error("Download failed. Please try again later.");
    } finally {
      setDownloading(false);
    }
  };

  return { downloading, downloadSelection };
}
