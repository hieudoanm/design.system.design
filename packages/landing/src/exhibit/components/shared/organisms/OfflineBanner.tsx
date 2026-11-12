'use client';

import { FC, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FiWifiOff } from 'react-icons/fi';

const OfflineBanner: FC = () => {
  const [isOffline, setIsOffline] = useState(false);

  console.log('[OfflineBanner] render', { isOffline });

  useEffect(() => {
    const handleOnline = () => {
      console.log('[OfflineBanner] online');
      setIsOffline(false);
    };

    const handleOffline = () => {
      console.log('[OfflineBanner] offline');
      setIsOffline(true);
    };

    setIsOffline(!navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {isOffline && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ type: 'tween', duration: 0.2 }}
          className="alert alert-warning fixed top-0 right-0 left-0 z-[60] flex justify-center rounded-none"
          role="alert">
          <FiWifiOff className="text-lg" />
          <span>You&apos;re offline. Some features may be limited.</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineBanner;
