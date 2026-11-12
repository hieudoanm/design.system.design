'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/tax/useEntitySync';
import { db } from '@/exhibit/lib/tax/db';
import type { Company } from '@/exhibit/types/tax';

interface CompaniesContextValue {
  companies: Company[];
  loading: boolean;
  addCompany: (company: Company) => Promise<void>;
  updateCompany: (company: Company) => Promise<void>;
  deleteCompany: (id: string) => Promise<void>;
}

const CompaniesContext = createContext<CompaniesContextValue | null>(null);

export const CompaniesProvider = ({ children }: { children: ReactNode }) => {
  console.log('[CompaniesProvider] render');
  const { data, loading, persistOne, removeOne } = useEntitySync<Company>(
    db.STORES.companies
  );

  const addCompany = useCallback(
    async (company: Company) => {
      await persistOne(company);
    },
    [persistOne]
  );

  const updateCompany = useCallback(
    async (company: Company) => {
      await persistOne(company);
    },
    [persistOne]
  );

  const deleteCompany = useCallback(
    async (id: string) => {
      await removeOne(id);
    },
    [removeOne]
  );

  const value: CompaniesContextValue = {
    companies: data,
    loading,
    addCompany,
    updateCompany,
    deleteCompany,
  };

  return (
    <CompaniesContext.Provider value={value}>
      {children}
    </CompaniesContext.Provider>
  );
};

export const useCompaniesContext = (): CompaniesContextValue => {
  const ctx = useContext(CompaniesContext);
  if (!ctx)
    throw new Error(
      'useCompaniesContext must be used within CompaniesProvider'
    );
  return ctx;
};
