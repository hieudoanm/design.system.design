'use client';

import { useEffect } from 'react';

export const useSWRegister = (): void => {
  useEffect(() => {
    if (typeof navigator === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const isDev = process.env.NODE_ENV === 'development';

    if (isDev) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const reg of registrations) reg.unregister();
      });
    } else {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }
  }, []);
};
