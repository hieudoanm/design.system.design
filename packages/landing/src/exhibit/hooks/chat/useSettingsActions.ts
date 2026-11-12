import { useCallback } from 'react';
import type { User, AppSettings } from '@/exhibit/types/chat';
import { db } from '@/exhibit/lib/chat/db';
import { OTHER } from '@/exhibit/providers/chat/data-helpers';

interface UseSettingsActionsParams {
  account: User | null;
  setAccount: React.Dispatch<React.SetStateAction<User | null>>;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const useSettingsActions = ({
  account,
  setAccount,
  setSettings,
}: UseSettingsActionsParams) => {
  const updateAccount = useCallback(
    async (partial: Partial<User>) => {
      const current = account ?? {
        id: OTHER,
        name: 'You',
        phone: '',
        username: 'you',
        avatarColor: '#ff0030',
        online: true,
        lastSeenAt: Date.now(),
      };
      const updated = { ...current, ...partial };
      await db.account.put(updated);
      setAccount(updated);
    },
    [account]
  );

  const updateSettings = useCallback(async (partial: Partial<AppSettings>) => {
    const current = await db.settings.get();
    const updated = { ...current, ...partial };
    await db.settings.put(updated);
    setSettings(updated);
  }, []);

  return { updateAccount, updateSettings };
};
