'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { insurance as seedInsurance } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Insurance } from '@/exhibit/types/wallet';

interface InsuranceContextValue {
  insurance: Insurance[];
  updateInsurance: (policy: Insurance) => Promise<void>;
  loading: boolean;
}

const InsuranceContext = createContext<InsuranceContextValue | null>(null);

export const InsuranceProvider = ({ children }: { children: ReactNode }) => {
  console.log('[InsuranceProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<Insurance>(
    db.STORES.insurance,
    seedInsurance
  );

  const updateInsurance = useCallback(
    async (updated: Insurance) => {
      console.log('[InsuranceProvider] updateInsurance', updated.id);
      setData(data.map((i) => (i.id === updated.id ? updated : i)));
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  return (
    <InsuranceContext.Provider
      value={{ insurance: data, updateInsurance, loading }}>
      {children}
    </InsuranceContext.Provider>
  );
};

export const useInsuranceContext = (): InsuranceContextValue => {
  const ctx = useContext(InsuranceContext);
  if (!ctx)
    throw new Error(
      'useInsuranceContext must be used within InsuranceProvider'
    );
  return ctx;
};
