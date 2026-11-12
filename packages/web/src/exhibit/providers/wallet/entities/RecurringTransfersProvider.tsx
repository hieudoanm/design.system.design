'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { recurringTransfers as seedRecurringTransfers } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { RecurringTransfer } from '@/exhibit/types/wallet';

interface RecurringTransfersContextValue {
  recurringTransfers: RecurringTransfer[];
  addRecurringTransfer: (transfer: RecurringTransfer) => Promise<void>;
  updateRecurringTransfer: (transfer: RecurringTransfer) => Promise<void>;
  loading: boolean;
}

const RecurringTransfersContext =
  createContext<RecurringTransfersContextValue | null>(null);

export const RecurringTransfersProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  console.log('[RecurringTransfersProvider] render');
  const { data, setData, loading, persist, persistOne } =
    useEntitySync<RecurringTransfer>(
      db.STORES.recurringTransfers,
      seedRecurringTransfers
    );

  const addRecurringTransfer = useCallback(
    async (transfer: RecurringTransfer) => {
      console.log(
        '[RecurringTransfersProvider] addRecurringTransfer',
        transfer.id
      );
      const next = [...data, transfer];
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  const updateRecurringTransfer = useCallback(
    async (updated: RecurringTransfer) => {
      console.log(
        '[RecurringTransfersProvider] updateRecurringTransfer',
        updated.id
      );
      setData(data.map((t) => (t.id === updated.id ? updated : t)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <RecurringTransfersContext.Provider
      value={{
        recurringTransfers: data,
        addRecurringTransfer,
        updateRecurringTransfer,
        loading,
      }}>
      {children}
    </RecurringTransfersContext.Provider>
  );
};

export const useRecurringTransfersContext =
  (): RecurringTransfersContextValue => {
    const ctx = useContext(RecurringTransfersContext);
    if (!ctx)
      throw new Error(
        'useRecurringTransfersContext must be used within RecurringTransfersProvider'
      );
    return ctx;
  };
