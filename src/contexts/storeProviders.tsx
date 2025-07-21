import { RouteStoreProvider } from "~/contexts/stores/routeStoreProvider";
import { SelectionStoreProvider } from "~/contexts/stores/selectionStoreProvider";

export function StoreProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <RouteStoreProvider>
      <SelectionStoreProvider>
        {children}
      </SelectionStoreProvider>
      </RouteStoreProvider>
    </>
  );
}

export default StoreProviders;
