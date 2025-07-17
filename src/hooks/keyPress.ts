import { useEffect, useCallback } from "react"

function isMacOS() {
  if ((navigator as any).userAgentData) {
    return (navigator as any).userAgentData.platform === "macOS";
  }
  return /Mac|iPod|iPhone|iPad/.test(navigator.userAgent);
}
function isCommandOrCtrlPressed(e: KeyboardEvent) {
  return isMacOS() ? e.metaKey : e.ctrlKey;
}

/**
 * A Hook that executes a function when a Key is pressed
 *
 * Ref: <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent>
 * @param onKeyPress Function to be executed when the Key is pressed
 * @param config Configuration object for the Keyboard Shortcut
 */
export function useKeyPress(onKeyPress: () => void, config: { key: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean; ctrlOrMetaKey?: boolean }) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = e;
    if (config.key !== key
    || (config.ctrlKey && !ctrlKey)
    || (config.shiftKey && !shiftKey)
    || (config.altKey && !altKey)
    || (config.metaKey && !metaKey)
    || (config.ctrlOrMetaKey && !isCommandOrCtrlPressed(e))) return;

    e.preventDefault();
    onKeyPress();
  }, [config, onKeyPress]) as EventListener;

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress]);
}
