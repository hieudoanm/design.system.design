'use client';

import { type ReactNode } from 'react';
import { DataProvider } from '@/exhibit/providers/password/DataProvider';
import { ToastProvider } from '@/exhibit/providers/password/ToastProvider';
import { SecurityProvider } from '@/exhibit/providers/password/SecurityProvider';
import { SWProvider } from '@/exhibit/providers/password/SWProvider';
import { ToastContainer } from '@/exhibit/components/password/organisms/ToastContainer';

export const Providers = ({ children }: { children: ReactNode }) => (
  <SWProvider>
    <ToastProvider>
      <DataProvider>
        <SecurityProvider>
          {children}
          <ToastContainer />
        </SecurityProvider>
      </DataProvider>
    </ToastProvider>
  </SWProvider>
);
