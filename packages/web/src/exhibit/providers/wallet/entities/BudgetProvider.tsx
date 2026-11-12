'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { budgetCategories as seedBudgetCategories } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { BudgetCategory } from '@/exhibit/types/wallet';

interface BudgetContextValue {
  budgetCategories: BudgetCategory[];
  updateBudgetCategory: (category: BudgetCategory) => Promise<void>;
  loading: boolean;
}

const BudgetContext = createContext<BudgetContextValue | null>(null);

export const BudgetProvider = ({ children }: { children: ReactNode }) => {
  console.log('[BudgetProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<BudgetCategory>(
    db.STORES.budgetCategories,
    seedBudgetCategories
  );

  const updateBudgetCategory = useCallback(
    async (updated: BudgetCategory) => {
      console.log('[BudgetProvider] updateBudgetCategory', updated.id);
      setData(data.map((c) => (c.id === updated.id ? updated : c)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <BudgetContext.Provider
      value={{ budgetCategories: data, updateBudgetCategory, loading }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudgetContext = (): BudgetContextValue => {
  const ctx = useContext(BudgetContext);
  if (!ctx)
    throw new Error('useBudgetContext must be used within BudgetProvider');
  return ctx;
};
