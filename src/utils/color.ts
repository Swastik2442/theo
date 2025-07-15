function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash >>> 0;
}

function hslColorFromHash(seed: number, offset = 0): string {
  const hue = (seed + offset) % 360;
  const saturation = 60 + (seed % 20);
  const lightness = 50 + (seed % 10);
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

export function gradientFromString(str: string): string {
  const hash = hashString(str);

  const angle = Math.abs(hash >> 2) % 360;
  const gradientType = [
    'linear-gradient',
    'radial-gradient'
  ][hash % 2] ?? 'radial-gradient';

  const color1 = hslColorFromHash(hash, 0);
  const color2 = hslColorFromHash(hash, 90);
  const color3 = hslColorFromHash(hash, 180);

  let gradient: string;
  if (gradientType === 'radial-gradient') {
    gradient = `${gradientType}(circle at center, ${color1}, ${color2}, ${color3})`;
  } else {
    gradient = `${gradientType}(${angle}deg, ${color1}, ${color2}, ${color3})`;
  }
  return gradient;
}
