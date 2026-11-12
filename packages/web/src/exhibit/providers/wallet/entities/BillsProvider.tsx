'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { recurringBills as seedRecurringBills } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { RecurringBill } from '@/exhibit/types/wallet';

interface BillsContextValue {
  recurringBills: RecurringBill[];
  addRecurringBill: (bill: RecurringBill) => Promise<void>;
  updateRecurringBill: (bill: RecurringBill) => Promise<void>;
  loading: boolean;
}

const BillsContext = createContext<BillsContextValue | null>(null);

export const BillsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[BillsProvider] render');
  const { data, setData, loading, persist, persistOne } =
    useEntitySync<RecurringBill>(db.STORES.recurringBills, seedRecurringBills);

  const addRecurringBill = useCallback(
    async (bill: RecurringBill) => {
      console.log('[BillsProvider] addRecurringBill', bill.id);
      const next = [...data, bill];
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  const updateRecurringBill = useCallback(
    async (updated: RecurringBill) => {
      console.log('[BillsProvider] updateRecurringBill', updated.id);
      setData(data.map((b) => (b.id === updated.id ? updated : b)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <BillsContext.Provider
      value={{
        recurringBills: data,
        addRecurringBill,
        updateRecurringBill,
        loading,
      }}>
      {children}
    </BillsContext.Provider>
  );
};

export const useBillsContext = (): BillsContextValue => {
  const ctx = useContext(BillsContext);
  if (!ctx)
    throw new Error('useBillsContext must be used within BillsProvider');
  return ctx;
};
