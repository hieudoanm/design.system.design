'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { recurringDeposits as seedRDs } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { RecurringDeposit } from '@/exhibit/types/wallet';

interface RDsContextValue {
  recurringDeposits: RecurringDeposit[];
  updateRecurringDeposit: (rd: RecurringDeposit) => Promise<void>;
  loading: boolean;
}

const RDsContext = createContext<RDsContextValue | null>(null);

export const RDsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[RDsProvider] render');
  const { data, setData, loading, persistOne } =
    useEntitySync<RecurringDeposit>(db.STORES.recurringDeposits, seedRDs);

  const updateRecurringDeposit = useCallback(
    async (updated: RecurringDeposit) => {
      console.log('[RDsProvider] updateRecurringDeposit', updated.id);
      setData(data.map((rd) => (rd.id === updated.id ? updated : rd)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <RDsContext.Provider
      value={{ recurringDeposits: data, updateRecurringDeposit, loading }}>
      {children}
    </RDsContext.Provider>
  );
};

export const useRDsContext = (): RDsContextValue => {
  const ctx = useContext(RDsContext);
  if (!ctx) throw new Error('useRDsContext must be used within RDsProvider');
  return ctx;
};
