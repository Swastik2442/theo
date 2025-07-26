"use client";

import type { Dispatch, SetStateAction } from "react";
import dynamic from "next/dynamic";
import { createStore } from 'zustand/vanilla';

const dialogRegistry = {
  NONE: dynamic(() => Promise.resolve({ default: () => <></>})),
  DELETE_SELECTION: dynamic(() => import("../components/selectionOptions").then(module => ({ default: module.DeleteSelectionDialog }))),
  MOVE_SELECTION: dynamic(() => import("../components/selectionOptions").then(module => ({ default: module.MoveSelectionDialog }))),
} as const;
type DialogRegistry = typeof dialogRegistry;

export type DialogState<T extends keyof DialogRegistry = keyof DialogRegistry> = {
  dialogType: T;
  DialogComponent: DialogRegistry[T];
  dialogOpen: boolean;
};
export type DialogActions = {
  setDialog: <T extends keyof DialogRegistry>(dialogType: T, dialogOpen?: boolean) => void;
  setDialogOpen: Dispatch<SetStateAction<boolean>>;
};
export type DialogStore = DialogState & DialogActions;

export const defaultInitState: DialogState<"NONE"> = {
  dialogType: "NONE",
  dialogOpen: false,
  DialogComponent: dialogRegistry["NONE"]
}

export const initDialogStore = (): DialogState<"NONE"> => {
  return { ...defaultInitState };
}

export const createDialogStore = (
  initState: DialogState = defaultInitState,
) => {
  return createStore<DialogStore>()((set) => ({
    ...initState,
    setDialog: (dialogType, dialogOpen: boolean = false) => set(() => ({
      dialogType,
      dialogOpen,
      DialogComponent: dialogRegistry[dialogType]
    })),
    setDialogOpen: (value) => (typeof value === "boolean") ? set(() => ({ dialogOpen: value })) : set((s) => ({ dialogOpen: value(s.dialogOpen) }))
  }))
}
