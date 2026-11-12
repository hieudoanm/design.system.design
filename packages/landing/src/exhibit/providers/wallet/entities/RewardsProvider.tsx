'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { cardRewards as seedRewards } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { CardReward } from '@/exhibit/types/wallet';

interface RewardsContextValue {
  cardRewards: CardReward[];
  updateCardReward: (reward: CardReward) => Promise<void>;
  loading: boolean;
}

const RewardsContext = createContext<RewardsContextValue | null>(null);

export const RewardsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[RewardsProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<CardReward>(
    db.STORES.cardRewards,
    seedRewards
  );

  const updateCardReward = useCallback(
    async (updated: CardReward) => {
      console.log('[RewardsProvider] updateCardReward', updated.id);
      setData(data.map((r) => (r.id === updated.id ? updated : r)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <RewardsContext.Provider
      value={{ cardRewards: data, updateCardReward, loading }}>
      {children}
    </RewardsContext.Provider>
  );
};

export const useRewardsContext = (): RewardsContextValue => {
  const ctx = useContext(RewardsContext);
  if (!ctx)
    throw new Error('useRewardsContext must be used within RewardsProvider');
  return ctx;
};
