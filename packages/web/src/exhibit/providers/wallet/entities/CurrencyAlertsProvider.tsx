'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { currencyAlerts as seedCurrencyAlerts } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { CurrencyAlert } from '@/exhibit/types/wallet';

interface CurrencyAlertsContextValue {
  currencyAlerts: CurrencyAlert[];
  addCurrencyAlert: (alert: CurrencyAlert) => Promise<void>;
  updateCurrencyAlert: (alert: CurrencyAlert) => Promise<void>;
  deleteCurrencyAlert: (id: string) => Promise<void>;
  loading: boolean;
}

const CurrencyAlertsContext = createContext<CurrencyAlertsContextValue | null>(
  null
);

export const CurrencyAlertsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  console.log('[CurrencyAlertsProvider] render');
  const { data, setData, loading, persist } = useEntitySync<CurrencyAlert>(
    db.STORES.currencyAlerts,
    seedCurrencyAlerts
  );

  const addCurrencyAlert = useCallback(
    async (alert: CurrencyAlert) => {
      console.log('[CurrencyAlertsProvider] addCurrencyAlert', alert.id);
      const next = [...data, alert];
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  const updateCurrencyAlert = useCallback(
    async (updated: CurrencyAlert) => {
      console.log('[CurrencyAlertsProvider] updateCurrencyAlert', updated.id);
      setData(data.map((a) => (a.id === updated.id ? updated : a)));
      await persist(data.map((a) => (a.id === updated.id ? updated : a)));
    },
    [data, setData, persist]
  );

  const deleteCurrencyAlert = useCallback(
    async (id: string) => {
      console.log('[CurrencyAlertsProvider] deleteCurrencyAlert', id);
      const next = data.filter((a) => a.id !== id);
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  return (
    <CurrencyAlertsContext.Provider
      value={{
        currencyAlerts: data,
        addCurrencyAlert,
        updateCurrencyAlert,
        deleteCurrencyAlert,
        loading,
      }}>
      {children}
    </CurrencyAlertsContext.Provider>
  );
};

export const useCurrencyAlertsContext = (): CurrencyAlertsContextValue => {
  const ctx = useContext(CurrencyAlertsContext);
  if (!ctx)
    throw new Error(
      'useCurrencyAlertsContext must be used within CurrencyAlertsProvider'
    );
  return ctx;
};
