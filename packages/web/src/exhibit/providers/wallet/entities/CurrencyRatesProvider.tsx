'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { currencyRates as seedCurrencyRates } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { CurrencyRate } from '@/exhibit/types/wallet';

interface CurrencyRatesContextValue {
  currencyRates: CurrencyRate[];
  loading: boolean;
}

const CurrencyRatesContext = createContext<CurrencyRatesContextValue | null>(
  null
);

export const CurrencyRatesProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  console.log('[CurrencyRatesProvider] render');
  const { data, loading } = useEntitySync<CurrencyRate>(
    db.STORES.currencyRates,
    seedCurrencyRates
  );

  return (
    <CurrencyRatesContext.Provider value={{ currencyRates: data, loading }}>
      {children}
    </CurrencyRatesContext.Provider>
  );
};

export const useCurrencyRatesContext = (): CurrencyRatesContextValue => {
  const ctx = useContext(CurrencyRatesContext);
  if (!ctx)
    throw new Error(
      'useCurrencyRatesContext must be used within CurrencyRatesProvider'
    );
  return ctx;
};
