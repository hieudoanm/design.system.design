'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/paths';

export const useServiceWorker = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const register = () => {
      // A failed registration (offline, unsupported scope) is not worth an
      // unhandled rejection — the site works fine without the worker.
      navigator.serviceWorker.register(withBasePath('/sw.js')).catch(() => {});
    };

    // The load event may already have fired by the time this runs.
    if (document.readyState === 'complete') {
      register();
    } else {
      window.addEventListener('load', register, { once: true });
    }
  }, []);
};
