'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/tax/useEntitySync';
import { db } from '@/exhibit/lib/tax/db';
import type { TaxAudit } from '@/exhibit/types/tax';

interface AuditsContextValue {
  audits: TaxAudit[];
  loading: boolean;
  addAudit: (audit: TaxAudit) => Promise<void>;
  updateAudit: (audit: TaxAudit) => Promise<void>;
  deleteAudit: (id: string) => Promise<void>;
}

const AuditsContext = createContext<AuditsContextValue | null>(null);

export const AuditsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[AuditsProvider] render');
  const { data, loading, persistOne, removeOne } = useEntitySync<TaxAudit>(
    db.STORES.audits
  );

  const addAudit = useCallback(
    async (audit: TaxAudit) => {
      await persistOne(audit);
    },
    [persistOne]
  );

  const updateAudit = useCallback(
    async (audit: TaxAudit) => {
      await persistOne(audit);
    },
    [persistOne]
  );

  const deleteAudit = useCallback(
    async (id: string) => {
      await removeOne(id);
    },
    [removeOne]
  );

  const value: AuditsContextValue = {
    audits: data,
    loading,
    addAudit,
    updateAudit,
    deleteAudit,
  };

  return (
    <AuditsContext.Provider value={value}>{children}</AuditsContext.Provider>
  );
};

export const useAuditsContext = (): AuditsContextValue => {
  const ctx = useContext(AuditsContext);
  if (!ctx)
    throw new Error('useAuditsContext must be used within AuditsProvider');
  return ctx;
};
