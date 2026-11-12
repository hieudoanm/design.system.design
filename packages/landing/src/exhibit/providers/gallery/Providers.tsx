'use client';

import { type FC, type ReactNode } from 'react';
import { DataProvider } from '@/exhibit/providers/gallery/DataProvider';
import { ToastProvider } from '@/exhibit/providers/gallery/ToastProvider';
import { SWProvider } from '@/exhibit/providers/gallery/SWProvider';
import { ToastContainer } from '@/exhibit/components/gallery/organisms/ToastContainer';

interface ProvidersProps {
  children: ReactNode;
}

export const Providers: FC<ProvidersProps> = ({ children }) => (
  <SWProvider>
    <ToastProvider>
      <DataProvider>
        {children}
        <ToastContainer />
      </DataProvider>
    </ToastProvider>
  </SWProvider>
);
