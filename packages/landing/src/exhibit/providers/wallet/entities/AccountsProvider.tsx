'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { accounts as seedAccounts } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Account } from '@/exhibit/types/wallet';

interface AccountsContextValue {
  accounts: Account[];
  updateAccount: (account: Account) => Promise<void>;
  addAccount: (account: Account) => Promise<void>;
  loading: boolean;
}

const AccountsContext = createContext<AccountsContextValue | null>(null);

export const AccountsProvider = ({ children }: { children: ReactNode }) => {
  console.log('[AccountsProvider] render');
  const { data, setData, loading, persist, persistOne } =
    useEntitySync<Account>(db.STORES.accounts, seedAccounts);

  const updateAccount = useCallback(
    async (updated: Account) => {
      console.log('[AccountsProvider] updateAccount', updated.id);
      const next = data.map((a) => (a.id === updated.id ? updated : a));
      setData(next);
      await persistOne(updated);
    },
    [data, setData, persistOne]
  );

  const addAccount = useCallback(
    async (account: Account) => {
      console.log('[AccountsProvider] addAccount', account.id);
      const next = [...data, account];
      setData(next);
      await persist(next);
    },
    [data, setData, persist]
  );

  return (
    <AccountsContext.Provider
      value={{ accounts: data, updateAccount, addAccount, loading }}>
      {children}
    </AccountsContext.Provider>
  );
};

export const useAccountsContext = (): AccountsContextValue => {
  const ctx = useContext(AccountsContext);
  if (!ctx)
    throw new Error('useAccountsContext must be used within AccountsProvider');
  return ctx;
};
