'use client';

import { useEffect } from 'react';
import { withBasePath } from '@/lib/paths';

export const useServiceWorker = () => {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(withBasePath('/sw.js'));
    });
  }, []);
};
