"use client";

import { useEffect, useCallback } from "react";

import { isMacOS } from "~/utils/platform";

/**
 * A Hook that executes a function when a Key is pressed
 *
 * Ref: <https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent>
 * @param onKeyPress Function to be executed when the Key is pressed
 * @param config Configuration object for the Keyboard Shortcut
 */
export function useKeyPress(
  onKeyPress: () => void,
  config: { key?: string; ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean; metaKey?: boolean; ctrlOrMetaKey?: boolean }
) {
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    const { key, ctrlKey, altKey, shiftKey, metaKey } = e;
    if (config.key && config.key !== key
    || (config.ctrlKey && !ctrlKey)
    || (config.shiftKey && !shiftKey)
    || (config.altKey && !altKey)
    || (config.metaKey && !metaKey)
    || (config.ctrlOrMetaKey && !(isMacOS() ? metaKey : ctrlKey))) return;

    e.preventDefault();
    onKeyPress();
  }, [config, onKeyPress]);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress)
    return () => document.removeEventListener("keydown", handleKeyPress)
  }, [handleKeyPress]);
}

export default useKeyPress;
