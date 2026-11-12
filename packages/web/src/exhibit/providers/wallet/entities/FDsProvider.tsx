'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { fixedDeposits as seedFDs } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { FixedDeposit } from '@/exhibit/types/wallet';

interface FDsContextValue {
  fixedDeposits: FixedDeposit[];
  updateFixedDeposit: (fd: FixedDeposit) => Promise<void>;
  loading: boolean;
}

const FDsContext = createContext<FDsContextValue | null>(null);

export const FDsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[FDsProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<FixedDeposit>(
    db.STORES.fixedDeposits,
    seedFDs
  );

  const updateFixedDeposit = useCallback(
    async (updated: FixedDeposit) => {
      console.log('[FDsProvider] updateFixedDeposit', updated.id);
      setData(data.map((fd) => (fd.id === updated.id ? updated : fd)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <FDsContext.Provider
      value={{ fixedDeposits: data, updateFixedDeposit, loading }}>
      {children}
    </FDsContext.Provider>
  );
};

export const useFDsContext = (): FDsContextValue => {
  const ctx = useContext(FDsContext);
  if (!ctx) throw new Error('useFDsContext must be used within FDsProvider');
  return ctx;
};
