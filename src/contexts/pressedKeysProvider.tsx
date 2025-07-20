"use client";

import { createContext, RefObject, useContext, useEffect, useRef } from "react"

type SpKeys = Prettify<Mutable<Pick<KeyboardEvent, "ctrlKey" | "shiftKey" | "altKey" | "metaKey">>>;

interface PressedKeysProviderProps {
  children: React.ReactNode
}

interface PressedKeysProviderState {
  keys: RefObject<SpKeys>;
}

const initialState: PressedKeysProviderState = {
  keys: { current: { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false } }
}

const PressedKeysProviderContext = createContext<PressedKeysProviderState>(initialState)

/**
 * A Context Provider to handle the PressedKeys of the Application
 * @param children Children components to the PressedKeysProvider
 */
export function PressedKeysProvider({
  children,
}: PressedKeysProviderProps) {
  const keysRef = useRef(initialState.keys.current);
  const setKeys = (e: KeyboardEvent) => {
    keysRef.current = {
      ctrlKey: e.ctrlKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
      metaKey: e.metaKey
    };
  };
  const reset = () => {
    keysRef.current = initialState.keys.current;
  };

  useEffect(() => {
    document.addEventListener("keydown", setKeys);
    document.addEventListener("keyup", setKeys);
    document.addEventListener("blur", reset, true);
    return () => {
      document.removeEventListener("keydown", setKeys);
      document.removeEventListener("keyup", setKeys);
      document.removeEventListener("blur", reset, true);
      reset();
    };
  }, []);

  const value: PressedKeysProviderState = { keys: keysRef };

  return (
    <PressedKeysProviderContext.Provider value={value}>
      {children}
    </PressedKeysProviderContext.Provider>
  );
}

/**
 * A Hook to access the PressedKeysProvider properties
 */
export const usePressedKeys = () => {
  const context = useContext(PressedKeysProviderContext);
  if (context === undefined)
    throw new Error("usePressedKeys must be used within a PressedKeysProvider");
  return context;
}
