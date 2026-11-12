'use client';

import { useEffect, useState } from 'react';

export const useSWRegister = (): boolean => {
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').then(
        () => setRegistered(true),
        () => setRegistered(false)
      );
    }
  }, []);

  return registered;
};
