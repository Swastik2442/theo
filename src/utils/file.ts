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
  if (!containsFileName(name)) return name;
  return path.extname(name);
}
