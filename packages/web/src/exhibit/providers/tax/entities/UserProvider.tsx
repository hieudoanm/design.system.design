'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/tax/useEntitySync';
import { db } from '@/exhibit/lib/tax/db';
import type { User } from '@/exhibit/types/tax';

interface UserContextValue {
  user: User | null;
  loading: boolean;
  updateUser: (user: User) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  console.log('[UserProvider] render');
  const { data, loading, persistOne } = useEntitySync<User>(db.STORES.user);

  const value: UserContextValue = {
    user: data[0] ?? null,
    loading,
    updateUser: persistOne,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextValue => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUserContext must be used within UserProvider');
  return ctx;
};
