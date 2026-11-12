'use client';

import { type FC, type ReactNode } from 'react';
import { useSWRegister } from '@/exhibit/hooks/password/useSWRegister';

export const SWProvider: FC<{ children: ReactNode }> = ({ children }) => {
  useSWRegister();
  return <>{children}</>;
};
