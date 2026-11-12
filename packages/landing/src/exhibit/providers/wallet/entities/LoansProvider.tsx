'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { loans as seedLoans } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Loan } from '@/exhibit/types/wallet';

interface LoansContextValue {
  loans: Loan[];
  updateLoan: (loan: Loan) => Promise<void>;
  loading: boolean;
}

const LoansContext = createContext<LoansContextValue | null>(null);

export const LoansProvider = ({ children }: { children: ReactNode }) => {
  console.log('[LoansProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<Loan>(
    db.STORES.loans,
    seedLoans
  );

  const updateLoan = useCallback(
    async (updated: Loan) => {
      console.log('[LoansProvider] updateLoan', updated.id);
      setData(data.map((l) => (l.id === updated.id ? updated : l)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <LoansContext.Provider value={{ loans: data, updateLoan, loading }}>
      {children}
    </LoansContext.Provider>
  );
};

export const useLoansContext = (): LoansContextValue => {
  const ctx = useContext(LoansContext);
  if (!ctx)
    throw new Error('useLoansContext must be used within LoansProvider');
  return ctx;
};
