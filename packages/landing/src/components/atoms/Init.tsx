'use client';

import { useServiceWorker } from '@/hooks/useServiceWorker';

const Init = () => {
  useServiceWorker();
  return null;
};

export default Init;
