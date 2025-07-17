"use client";

import { useEffect, useState } from "react";

export function useClientHost() {
  const [hostUrl, setHostUrl] = useState<string | null>(null);

  useEffect(() => {
    const { protocol, host } = window.location;
    setHostUrl(`${protocol}//${host}`);
  }, []);

  return hostUrl;
}

export default useClientHost;
