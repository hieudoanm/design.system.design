'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { cards as seedCards } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Card } from '@/exhibit/types/wallet';

interface CardsContextValue {
  cards: Card[];
  updateCard: (card: Card) => Promise<void>;
  loading: boolean;
}

const CardsContext = createContext<CardsContextValue | null>(null);

export const CardsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[CardsProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<Card>(
    db.STORES.cards,
    seedCards
  );

  const updateCard = useCallback(
    async (updated: Card) => {
      console.log('[CardsProvider] updateCard', updated.id);
      setData(data.map((c) => (c.id === updated.id ? updated : c)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <CardsContext.Provider value={{ cards: data, updateCard, loading }}>
      {children}
    </CardsContext.Provider>
  );
};

export const useCardsContext = (): CardsContextValue => {
  const ctx = useContext(CardsContext);
  if (!ctx)
    throw new Error('useCardsContext must be used within CardsProvider');
  return ctx;
};
