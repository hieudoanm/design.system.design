'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { savingsGoals as seedGoals } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { SavingsGoal } from '@/exhibit/types/wallet';

interface GoalsContextValue {
  savingsGoals: SavingsGoal[];
  updateSavingsGoal: (goal: SavingsGoal) => Promise<void>;
  loading: boolean;
}

const GoalsContext = createContext<GoalsContextValue | null>(null);

export const GoalsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[GoalsProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<SavingsGoal>(
    db.STORES.savingsGoals,
    seedGoals
  );

  const updateSavingsGoal = useCallback(
    async (updated: SavingsGoal) => {
      console.log('[GoalsProvider] updateSavingsGoal', updated.id);
      setData(data.map((g) => (g.id === updated.id ? updated : g)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <GoalsContext.Provider
      value={{ savingsGoals: data, updateSavingsGoal, loading }}>
      {children}
    </GoalsContext.Provider>
  );
};

export const useGoalsContext = (): GoalsContextValue => {
  const ctx = useContext(GoalsContext);
  if (!ctx)
    throw new Error('useGoalsContext must be used within GoalsProvider');
  return ctx;
};
