'use client';

import { type ReactNode } from 'react';
import { DataProvider } from '@/exhibit/providers/tax/DataProvider';
import { ToastProvider } from '@/exhibit/providers/tax/ToastProvider';
import OfflineBanner from '@/exhibit/components/shared/organisms/OfflineBanner';
import SkipToContent from '@/exhibit/components/shared/organisms/SkipToContent';

export const Providers = ({ children }: { children: ReactNode }) => {
  console.log('[Providers] render');
  return (
    <ToastProvider>
      <DataProvider>
        <SkipToContent />
        <OfflineBanner />
        {children}
      </DataProvider>
    </ToastProvider>
  );
};
