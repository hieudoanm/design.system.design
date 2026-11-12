'use client';

import { createContext, useCallback, useContext, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/tax/useEntitySync';
import { db } from '@/exhibit/lib/tax/db';
import type { TaxSubmission } from '@/exhibit/types/tax';

interface SubmissionsContextValue {
  submissions: TaxSubmission[];
  loading: boolean;
  addSubmission: (submission: TaxSubmission) => Promise<void>;
  updateSubmission: (submission: TaxSubmission) => Promise<void>;
  deleteSubmission: (id: string) => Promise<void>;
}

const SubmissionsContext = createContext<SubmissionsContextValue | null>(null);

export const SubmissionsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[SubmissionsProvider] render');
  const { data, loading, persistOne, removeOne } = useEntitySync<TaxSubmission>(
    db.STORES.submissions
  );

  const addSubmission = useCallback(
    async (submission: TaxSubmission) => {
      await persistOne(submission);
    },
    [persistOne]
  );

  const updateSubmission = useCallback(
    async (submission: TaxSubmission) => {
      await persistOne(submission);
    },
    [persistOne]
  );

  const deleteSubmission = useCallback(
    async (id: string) => {
      await removeOne(id);
    },
    [removeOne]
  );

  const value: SubmissionsContextValue = {
    submissions: data,
    loading,
    addSubmission,
    updateSubmission,
    deleteSubmission,
  };

  return (
    <SubmissionsContext.Provider value={value}>
      {children}
    </SubmissionsContext.Provider>
  );
};

export const useSubmissionsContext = (): SubmissionsContextValue => {
  const ctx = useContext(SubmissionsContext);
  if (!ctx)
    throw new Error(
      'useSubmissionsContext must be used within SubmissionsProvider'
    );
  return ctx;
};
