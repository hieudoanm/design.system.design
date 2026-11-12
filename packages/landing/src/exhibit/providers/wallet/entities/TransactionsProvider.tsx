'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { transactions as seedTransactions } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Transaction } from '@/exhibit/types/wallet';

interface TransactionsContextValue {
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => Promise<void>;
  loading: boolean;
}

const TransactionsContext = createContext<TransactionsContextValue | null>(
  null
);

export const TransactionsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[TransactionsProvider] render');
  const { data, setData, loading, persist } = useEntitySync<Transaction>(
    db.STORES.transactions,
    seedTransactions
  );

  const addTransaction = useCallback(
    async (tx: Transaction) => {
      console.log('[TransactionsProvider] addTransaction', tx.id);
      const next = [tx, ...data];
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  return (
    <TransactionsContext.Provider
      value={{ transactions: data, addTransaction, loading }}>
      {children}
    </TransactionsContext.Provider>
  );
};

export const useTransactionsContext = (): TransactionsContextValue => {
  const ctx = useContext(TransactionsContext);
  if (!ctx)
    throw new Error(
      'useTransactionsContext must be used within TransactionsProvider'
    );
  return ctx;
};
