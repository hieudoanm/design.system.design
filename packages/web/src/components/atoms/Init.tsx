'use client';

import { useTheme } from '@/hooks/useTheme';
import { useServiceWorker } from '@/hooks/useServiceWorker';

const Init = () => {
  useTheme();
  useServiceWorker();
  return null;
};

export default Init;
