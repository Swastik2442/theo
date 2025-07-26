import { RouteStoreProvider } from "~/contexts/stores/routeStoreProvider";
import { SelectionStoreProvider } from "~/contexts/stores/selectionStoreProvider";
import { DialogStoreProvider } from "~/contexts/stores/dialogStoreProvider";
import { DialogManager } from "~/components/DialogManager";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteStoreProvider>
      <SelectionStoreProvider>
      <DialogStoreProvider>
        {children}
        <DialogManager />
      </DialogStoreProvider>
      </SelectionStoreProvider>
      </RouteStoreProvider>
    </>
  );
}

export default StoreProviders;
