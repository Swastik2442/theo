export function isMacOS() {
  if ((navigator as any).userAgentData) {
    return (navigator as any).userAgentData.platform === "macOS";
  }
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}
