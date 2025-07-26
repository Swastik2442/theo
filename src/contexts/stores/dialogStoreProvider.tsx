'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';

import {
  type DialogStore,
  createDialogStore,
  initDialogStore,
} from '~/stores/dialogStore';

export type DialogStoreApi = ReturnType<typeof createDialogStore>;

export const DialogStoreContext = createContext<DialogStoreApi | undefined>(undefined);

export interface DialogStoreProviderProps {
  children: ReactNode;
}

export const DialogStoreProvider = ({
  children,
}: DialogStoreProviderProps) => {
  const storeRef = useRef<DialogStoreApi | null>(null);
  if (storeRef.current === null) {
    storeRef.current = createDialogStore(initDialogStore());
  }

  return (
    <DialogStoreContext.Provider value={storeRef.current}>
      {children}
    </DialogStoreContext.Provider>
  );
}

export const useDialogStore = <T,>(
  selector: (store: DialogStore) => T,
): T => {
  const dialogStoreContext = useContext(DialogStoreContext);

  if (!dialogStoreContext) {
    throw new Error(`useDialogStore must be used within DialogStoreProvider`);
  }

  return useStore(dialogStoreContext, selector);
}
