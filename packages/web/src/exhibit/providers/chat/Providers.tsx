'use client';

import { type FC, type ReactNode } from 'react';
import { ToastProvider } from '@/exhibit/providers/chat/ToastProvider';
import { DataProvider } from '@/exhibit/providers/chat/DataProvider';
import { ToastViewport } from '@/exhibit/components/chat/molecules/ToastViewport';

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <ToastProvider>
    <DataProvider>{children}</DataProvider>
    <ToastViewport />
  </ToastProvider>
);
