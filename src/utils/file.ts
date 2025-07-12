const fileExtensions = [
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'tiff', 'tif', 'heic', 'heif', 'ico',
  'svg', 'eps', 'ai',
  'raw', 'cr2', 'nef', 'orf', 'sr2', 'arw', 'dng', 'rw2', 'pef',
  'avif', 'jxr', 'wdp', 'apng'
];

const fileRegex = new RegExp(`\\b[\\w\\-]+\\.(${fileExtensions.join('|')})\\b`, 'i');
const containsFileName = (str: string) => fileRegex.test(str);

// TODO: Handle no extension case
export function removedExtension(name: string) {
  if (!containsFileName(name)) return name;
  return name.replace(/\.[^/.]+$/, "");
}
