"use client";

import { useShallow } from "zustand/react/shallow";
import { useDialogStore } from "~/contexts/stores/dialogStoreProvider";

export function DialogManager() {
  const { dialogOpen, setDialogOpen, DialogComponent } = useDialogStore(useShallow((s) => ({
    dialogType: s.dialogType,
    dialogOpen: s.dialogOpen,
    setDialogOpen: s.setDialogOpen,
    DialogComponent: s.DialogComponent
  })));

  return <DialogComponent dialogOpen={dialogOpen} setDialogOpenAction={setDialogOpen} />;
}
