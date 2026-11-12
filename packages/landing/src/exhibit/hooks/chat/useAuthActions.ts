import { useCallback } from 'react';
import type { User, AuthSession, AuthMethod } from '@/exhibit/types/chat';
import { db } from '@/exhibit/lib/chat/db';

interface UseAuthActionsParams {
  refreshData: () => Promise<void>;
  setAccount: React.Dispatch<React.SetStateAction<User | null>>;
  setSession: React.Dispatch<React.SetStateAction<AuthSession | null>>;
  setContacts: React.Dispatch<React.SetStateAction<never[]>>;
  setChats: React.Dispatch<React.SetStateAction<never[]>>;
  setMessages: React.Dispatch<React.SetStateAction<never[]>>;
}

export const useAuthActions = ({
  refreshData,
  setAccount,
  setSession,
  setContacts,
  setChats,
  setMessages,
}: UseAuthActionsParams) => {
  const signUp = useCallback(
    async (name: string, phone: string, username: string): Promise<void> => {
      const user: User = {
        id: 'me',
        name,
        phone,
        username,
        avatarColor: '#ff0030',
        online: true,
        lastSeenAt: Date.now(),
      };
      await db.account.put(user);
      const authSession: AuthSession = {
        id: 'session',
        method: 'phone',
        identifier: phone,
        signedInAt: Date.now(),
      };
      await db.auth.put(authSession);
      setAccount(user);
      setSession(authSession);
      await refreshData();
    },
    [refreshData]
  );

  const signIn = useCallback(
    async (method: AuthMethod, identifier: string): Promise<void> => {
      const accounts = await db.account.getAll();
      const found = accounts.find((a) =>
        method === 'phone' ? a.phone === identifier : a.username === identifier
      );
      if (!found) throw new Error('Account not found');
      const authSession: AuthSession = {
        id: 'session',
        method,
        identifier,
        signedInAt: Date.now(),
      };
      await db.auth.put(authSession);
      setAccount(found);
      setSession(authSession);
      await refreshData();
    },
    [refreshData]
  );

  const signOut = useCallback(async (): Promise<void> => {
    await db.auth.delete();
    setSession(null);
    setAccount(null);
    setContacts([]);
    setChats([]);
    setMessages([]);
  }, []);

  return { signUp, signIn, signOut };
};
