import path from "path";

/** @see https://github.com/broofa/mime/blob/main/types/standard.ts */
export const imageMimeTypes = {
  'image/aces': ['exr'],
  'image/apng': ['apng'],
  'image/avci': ['avci'],
  'image/avcs': ['avcs'],
  'image/avif': ['avif'],
  'image/bmp': ['bmp', 'dib'],
  'image/cgm': ['cgm'],
  'image/dicom-rle': ['drle'],
  'image/dpx': ['dpx'],
  'image/emf': ['emf'],
  'image/fits': ['fits'],
  'image/g3fax': ['g3'],
  'image/gif': ['gif'],
  'image/heic': ['heic'],
  'image/heic-sequence': ['heics'],
  'image/heif': ['heif'],
  'image/heif-sequence': ['heifs'],
  'image/hej2k': ['hej2'],
  'image/ief': ['ief'],
  'image/jaii': ['jaii'],
  'image/jais': ['jais'],
  'image/jls': ['jls'],
  'image/jp2': ['jp2', 'jpg2'],
  'image/jpeg': ['jpg', 'jpeg', 'jpe'],
  'image/jph': ['jph'],
  'image/jphc': ['jhc'],
  'image/jpm': ['jpm', 'jpgm'],
  'image/jpx': ['jpx', 'jpf'],
  'image/jxl': ['jxl'],
  'image/jxr': ['jxr'],
  'image/jxra': ['jxra'],
  'image/jxrs': ['jxrs'],
  'image/jxs': ['jxs'],
  'image/jxsc': ['jxsc'],
  'image/jxsi': ['jxsi'],
  'image/jxss': ['jxss'],
  'image/ktx': ['ktx'],
  'image/ktx2': ['ktx2'],
  'image/pjpeg': ['jfif'],
  'image/png': ['png'],
  'image/sgi': ['sgi'],
  'image/svg+xml': ['svg', 'svgz'],
  'image/t38': ['t38'],
  'image/tiff': ['tif', 'tiff'],
  'image/tiff-fx': ['tfx'],
  'image/webp': ['webp'],
  'image/wmf': ['wmf']
} as const;
export const imageExtensions = Object.fromEntries(
  Object.entries(imageMimeTypes).flatMap(
    ([mime, exts]) => exts.map(ext => [ext, mime as keyof typeof imageMimeTypes])
  )
);

const fileRegex = new RegExp(`\\b[\\w\\-]+\\.(${Object.keys(imageExtensions).join('|')})\\b`, 'i');
const containsFileName = (str: string) => fileRegex.test(str);

/**
 * Extracts the File Name from File Name with known Extensions
 * @param name File Name with Extension
 * @returns File Name without Extension if Extension is known else {@link name}
 */
export function fileName(name: string) {
  if (!containsFileName(name)) return name;
  return path.basename(name, path.extname(name));
}

/**
 * Extracts the File Extension from File Name with known Extensions
 * @param name File Name with Extension
 * @returns File Extension if Extension is known else Empty String
 */
export function fileExtension(name: string) {
  if (!containsFileName(name)) return "";
  return path.extname(name);
}

export function typesObjFromFileName(name: string): SaveFilePickerTypes {
  const mime = imageExtensions[fileExtension(name).slice(1)];
  if (!mime) throw new Error("Extension not supported");
  const exts = imageMimeTypes[mime];
  return [{ accept: { [mime]: exts.map((ext) => `.${ext}`) } }];
}

/**
 * Prompts the User to download a File from a URL
 * @param url URL to download from
 * @param fileName Optional Name for the File
 */
export function downloadFromUrl(url: string, fileName: string = "") {
  const element = document.createElement('a');
  element.setAttribute('href', url);
  element.setAttribute('download', fileName);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

// Feature detection. The API needs to be supported
// and the app not run in an iframe.
const supportsFileSystemAccess = () =>
  'showSaveFilePicker' in window &&
  (() => {
    try {
      return window.self === window.top;
    } catch {
      return false;
    }
  })();

/** @see https://developer.mozilla.org/en-US/docs/Web/API/Window/showSaveFilePicker#types */
type SaveFilePickerTypes = {
  accept: Record<string, readonly string[]>;
  description?: string;
}[];
type FetchInput = Parameters<typeof fetch>['0'];

/**
 * Downloads a File as a Blob and prompts the User to download the Blob
 * @param input URL to download from
 * @param init Request Init Parameters
 * @param fileName Optional Name for the Name
 */
export async function downloadAsBlob(input: FetchInput, init?: RequestInit, suggestedName?: string, types?: SaveFilePickerTypes) {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }

  if (supportsFileSystemAccess()) {
    try {
      let byteLength = 0;
      // TODO: Add a way to use default download location and actually show up in Downloads tab of Browser
      const handle = await (window as any).showSaveFilePicker({ suggestedName, types });
      const writable = await handle.createWritable();

      const reader = response.body!.getReader()
      const pump = () => reader.read().then(async ({ value, done }): Promise<void> => {
        if (done) return Promise.resolve();
        writable.write(value!);

        byteLength += value.byteLength;
        writable.seek(byteLength);
        return pump();
      });
      pump().then(() => writable.close());
      return;
    } catch (err) {
      if (err instanceof Error) {
        // Fail silently if the user has simply canceled the dialog
        if (err.name !== 'AbortError') {
          throw err;
        }
        return;
      }
    }
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  downloadFromUrl(objectUrl, suggestedName);
  URL.revokeObjectURL(objectUrl);
}

/**
 * Copies an Image from a URL to the Clipboard
 * @param url URL to load the Image from
 */
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
