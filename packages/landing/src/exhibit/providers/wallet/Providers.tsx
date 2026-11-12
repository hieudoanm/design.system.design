'use client';

import { ReactNode } from 'react';
import { DataProvider } from '@/exhibit/providers/wallet/DataProvider';
import { SWProvider } from '@/exhibit/providers/wallet/SWProvider';
import { ToastProvider } from '@/exhibit/providers/wallet/ToastProvider';
import OfflineBanner from '@/exhibit/components/shared/organisms/OfflineBanner';
import SkipToContent from '@/exhibit/components/shared/organisms/SkipToContent';

export const Providers = ({ children }: { children: ReactNode }) => {
  console.log('[Providers] render');
  return (
    <SWProvider>
      <ToastProvider>
        <DataProvider>
          <SkipToContent />
          <OfflineBanner />
          {children}
        </DataProvider>
      </ToastProvider>
    </SWProvider>
  );
};
