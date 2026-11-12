'use client';

import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { useEntitySync } from '@/exhibit/hooks/wallet/useEntitySync';
import { notifications as seedNotifications } from '@/exhibit/data/wallet/mock';
import { db } from '@/exhibit/lib/wallet/db';
import type { Notification } from '@/exhibit/types/wallet';

interface NotificationsContextValue {
  notifications: Notification[];
  markNotificationRead: (id: string) => Promise<void>;
  loading: boolean;
}

const NotificationsContext = createContext<NotificationsContextValue | null>(
  null
);

export const NotificationsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  console.log('[NotificationsProvider] render');
  const { data, setData, loading, persistOne } = useEntitySync<Notification>(
    db.STORES.notifications,
    seedNotifications
  );

  const markNotificationRead = useCallback(
    async (id: string) => {
      console.log('[NotificationsProvider] markNotificationRead', id);
      const updated = data.find((n) => n.id === id);
      setData(data.map((n) => (n.id === id ? { ...n, read: true } : n)));
      if (updated) await persistOne({ ...updated, read: true });
    },
    [data, setData, persistOne]
  );

  return (
    <NotificationsContext.Provider
      value={{ notifications: data, markNotificationRead, loading }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotificationsContext = (): NotificationsContextValue => {
  const ctx = useContext(NotificationsContext);
  if (!ctx)
    throw new Error(
      'useNotificationsContext must be used within NotificationsProvider'
    );
  return ctx;
};
