'use client';

import { useEffect } from 'react';

export const useTheme = () => {
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme');
      const dark = stored
        ? stored === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = dark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute('content', dark ? '#0e1116' : '#f2f4f1');
    } catch {
      /* ignore */
    }
  }, []);
};
