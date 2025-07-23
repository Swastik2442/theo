import path from "path";

const fileExtensions = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'heic', 'heif', 'ico',
  'svg', 'eps', 'ai',
  'raw', 'cr2', 'nef', 'orf', 'sr2', 'arw', 'dng', 'rw2', 'pef',
  'avif', 'jxr', 'wdp', 'apng'
];

const fileRegex = new RegExp(`\\b[\\w\\-]+\\.(${fileExtensions.join('|')})\\b`, 'i');
const containsFileName = (str: string) => fileRegex.test(str);

export function fileName(name: string) {
  if (!containsFileName(name)) return name;
  return path.basename(name, path.extname(name));
}

export function fileExtension(name: string) {
  if (!containsFileName(name)) return "";
  return path.extname(name);
}

type FetchInput = Parameters<typeof fetch>['0'];
export async function downloadFromUrl(fileName: string, url: FetchInput, init?: RequestInit) {
  // Downloads the file and converts to a Blob
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const element = document.createElement('a');
  element.setAttribute('href', objectUrl);
  element.setAttribute('download', fileName);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);

  URL.revokeObjectURL(objectUrl);
}

export async function copyImageToClipboard(url: string) {
  // Downloads the image // TODO: Can be optimized to avoid downloading by storing in cache
  const data = await fetch(url);
  if (!data.ok) {
    throw new Error("Failed to copy image");
  }

  // converts to a Blob
  const blob = await data.blob();
  if (!blob.type.startsWith('image/')) {
    throw new Error("Fetched data is not an image");
  }

  // If MIME type is supported, copy it directly
  if (ClipboardItem.supports(blob.type)) {
    navigator.clipboard.write([
      new ClipboardItem({ [blob.type]: blob })
    ]);
    return;
  }

  // Otherwise, create a canvas to convert the image to PNG
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error("Failed to create canvas context");
  }

  // Create an image element to load the blob
  const img = new Image();
  img.src = URL.createObjectURL(blob);
  await new Promise((resolve) => {
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      resolve(null);
    };
  });
  URL.revokeObjectURL(img.src);
  img.src = "";

  // Convert canvas to PNG Blob
  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Failed to convert image to PNG"));
        return;
      }
      resolve(blob);
    }, 'image/png');
  });

  // Write the PNG Blob to clipboard
  await navigator.clipboard.write([
    new ClipboardItem({ [pngBlob.type]: pngBlob })
  ]);
}
