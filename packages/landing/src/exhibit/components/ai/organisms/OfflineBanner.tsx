'use client';

import { type FC, useState, useEffect } from 'react';
import { FiWifiOff } from 'react-icons/fi';

export const OfflineBanner: FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    setIsOffline(!navigator.onLine);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-warning text-warning-content fixed top-0 right-0 left-0 z-50 flex items-center justify-center gap-2 px-4 py-2">
      <FiWifiOff className="size-4" />
      <span className="text-sm font-medium">
        You are offline. Some features may be unavailable.
      </span>
    </div>
  );
};
