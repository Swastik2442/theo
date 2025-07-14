'use client';

import { type ReactNode, createContext, useRef, useContext } from 'react';
import { useStore } from 'zustand';

import {
  type RouteStore,
  createRouteStore,
  initRouteStore,
} from '~/stores/routeStore';

export type RouteStoreApi = ReturnType<typeof createRouteStore>

export const RouteStoreContext = createContext<RouteStoreApi | undefined>(undefined)

export interface RouteStoreProviderProps {
  children: ReactNode
}

export const RouteStoreProvider = ({
  children,
}: RouteStoreProviderProps) => {
  const storeRef = useRef<RouteStoreApi | null>(null)
  if (storeRef.current === null) {
    storeRef.current = createRouteStore(initRouteStore())
  }

  return (
    <RouteStoreContext.Provider value={storeRef.current}>
      {children}
    </RouteStoreContext.Provider>
  )
}

export const useRouteStore = <T,>(
  selector: (store: RouteStore) => T,
): T => {
  const routeStoreContext = useContext(RouteStoreContext)

  if (!routeStoreContext) {
    throw new Error(`useRouteStore must be used within RouteStoreProvider`)
  }

  return useStore(routeStoreContext, selector)
}
