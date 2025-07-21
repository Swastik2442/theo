'use client';

import { useEffect } from 'react';
import { useRouteStore } from '~/contexts/stores/routeStoreProvider';

export default function NotFound() {
  const setIsUnknown = useRouteStore((s) => s.setIsUnknown);

  useEffect(() => {
    setIsUnknown(true);
    return () => setIsUnknown(false);
  }, [setIsUnknown]);

  return <p className='pt-2 text-xl text-center'>Page Not Found</p>;
}
