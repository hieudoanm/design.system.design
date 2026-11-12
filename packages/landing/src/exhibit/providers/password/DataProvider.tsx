'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  VaultItem,
  Folder,
  Settings,
  ShareRecipient,
  AccessEntry,
} from '@/exhibit/types/password';
import { db } from '@/exhibit/lib/password/db';
import { seedDatabase } from '@/exhibit/data/password/seed';

const TRASH_RETENTION_DAYS = 30;
const ACCESS_LOG_MAX = 50;

interface DataContextType {
  items: VaultItem[];
  trashedItems: VaultItem[];
  folders: Folder[];
  settings: Settings;
  isLoading: boolean;
  currentItem: VaultItem | null;
  setCurrentItem: (item: VaultItem | null) => void;
  createItem: (
    item: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<VaultItem>;
  updateItem: (id: string, updates: Partial<VaultItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  trashItem: (id: string) => Promise<void>;
  restoreItem: (id: string) => Promise<void>;
  duplicateItem: (id: string) => Promise<VaultItem | undefined>;
  touchItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createFolder: (name: string, isTeam?: boolean) => Promise<Folder>;
  renameFolder: (id: string, name: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  toggleFolderTeam: (id: string) => Promise<void>;
  shareItem: (id: string, recipient: ShareRecipient) => Promise<void>;
  revokeShare: (id: string, email: string) => Promise<void>;
  logAccess: (
    id: string,
    action: AccessEntry['action'],
    detail?: string
  ) => Promise<void>;
  importItems: (
    list: Array<Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>>
  ) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => Promise<void>;
  requestEmergencyAccess: (
    email: string,
    delayMinutes: number
  ) => Promise<void>;
  cancelEmergencyRequest: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);
export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [allItems, setAllItems] = useState<VaultItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [settings, setSettings] = useState<Settings>({
    theme: 'password-light',
    autoLockTimeout: 5,
    clipboardClear: 30,
    biometricEnabled: false,
    lockOnClose: false,
  });
  const [currentItem, setCurrentItem] = useState<VaultItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const items = allItems.filter((i) => !i.deletedAt);
  const trashedItems = allItems.filter((i) => i.deletedAt);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await seedDatabase();
    const [i, f, s] = await Promise.all([
      db.items.getAll(),
      db.folders.getAll(),
      db.settings.get(),
    ]);
    const cutoff = Date.now() - TRASH_RETENTION_DAYS * 86400000;
    const expired = i.filter(
      (item) => item.deletedAt !== undefined && item.deletedAt < cutoff
    );
    if (expired.length > 0) {
      await Promise.all(expired.map((item) => db.items.delete(item.id)));
    }
    setAllItems(
      i
        .filter((item) => !expired.includes(item))
        .sort((a, b) => b.updatedAt - a.updatedAt)
    );
    setFolders(f);
    setSettings(s);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createItem = useCallback(
    async (data: Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>) => {
      const item: VaultItem = {
        ...data,
        id: `v-${Date.now()}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.items.put(item);
      setAllItems((p) => [item, ...p]);
      return item;
    },
    []
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<VaultItem>) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const updated = { ...item, ...updates, updatedAt: Date.now() };
        await db.items.put(updated);
        setAllItems((p) => p.map((i) => (i.id === id ? updated : i)));
      }
    },
    [allItems]
  );

  const deleteItem = useCallback(async (id: string) => {
    await db.items.delete(id);
    setAllItems((p) => p.filter((i) => i.id !== id));
  }, []);

  const trashItem = useCallback(
    async (id: string) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const updated = { ...item, deletedAt: Date.now() };
        await db.items.put(updated);
        setAllItems((p) => p.map((i) => (i.id === id ? updated : i)));
      }
    },
    [allItems]
  );

  const restoreItem = useCallback(
    async (id: string) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const updated = {
          ...item,
          deletedAt: undefined,
          updatedAt: Date.now(),
        };
        await db.items.put(updated);
        setAllItems((p) => p.map((i) => (i.id === id ? updated : i)));
      }
    },
    [allItems]
  );

  const duplicateItem = useCallback(
    async (id: string): Promise<VaultItem | undefined> => {
      const item = allItems.find((i) => i.id === id);
      if (!item) return undefined;
      const copy: VaultItem = {
        ...item,
        id: `v-${Date.now()}`,
        title: `${item.title} (copy)`,
        deletedAt: undefined,
        lastUsed: undefined,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.items.put(copy);
      setAllItems((p) => [copy, ...p]);
      return copy;
    },
    [allItems]
  );

  const touchItem = useCallback(
    async (id: string) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const updated = { ...item, lastUsed: Date.now() };
        await db.items.put(updated);
        setAllItems((p) => p.map((i) => (i.id === id ? updated : i)));
      }
    },
    [allItems]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const updated = {
          ...item,
          favorite: !item.favorite,
          updatedAt: Date.now(),
        };
        await db.items.put(updated);
        setAllItems((p) => p.map((i) => (i.id === id ? updated : i)));
      }
    },
    [allItems]
  );

  const createFolder = useCallback(
    async (name: string, isTeam = false): Promise<Folder> => {
      const folder: Folder = {
        id: `f-${Date.now()}`,
        name: name.trim(),
        isTeam,
        createdAt: Date.now(),
      };
      await db.folders.put(folder);
      setFolders((p) => [...p, folder]);
      return folder;
    },
    []
  );

  const renameFolder = useCallback(
    async (id: string, name: string) => {
      const folder = folders.find((f) => f.id === id);
      if (folder) {
        const updated = { ...folder, name: name.trim() };
        await db.folders.put(updated);
        setFolders((p) => p.map((f) => (f.id === id ? updated : f)));
      }
    },
    [folders]
  );

  const toggleFolderTeam = useCallback(
    async (id: string) => {
      const folder = folders.find((f) => f.id === id);
      if (folder) {
        const updated = { ...folder, isTeam: !folder.isTeam };
        await db.folders.put(updated);
        setFolders((p) => p.map((f) => (f.id === id ? updated : f)));
      }
    },
    [folders]
  );

  const logAccess = useCallback(
    async (id: string, action: AccessEntry['action'], detail?: string) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const entry: AccessEntry = { action, timestamp: Date.now(), detail };
        const accessLog = [entry, ...(item.accessLog ?? [])].slice(
          0,
          ACCESS_LOG_MAX
        );
        const updated = { ...item, accessLog };
        await db.items.put(updated);
        setAllItems((p) => p.map((i) => (i.id === id ? updated : i)));
      }
    },
    [allItems]
  );

  const shareItem = useCallback(
    async (id: string, recipient: ShareRecipient) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const others = (item.sharedWith ?? []).filter(
          (r) => r.email !== recipient.email
        );
        const sharedWith = [...others, recipient];
        await db.items.put({ ...item, sharedWith });
        await logAccess(id, 'share', recipient.email);
        setAllItems((p) =>
          p.map((i) => (i.id === id ? { ...i, sharedWith } : i))
        );
      }
    },
    [allItems, logAccess]
  );

  const revokeShare = useCallback(
    async (id: string, email: string) => {
      const item = allItems.find((i) => i.id === id);
      if (item) {
        const sharedWith = (item.sharedWith ?? []).filter(
          (r) => r.email !== email
        );
        await db.items.put({ ...item, sharedWith });
        setAllItems((p) =>
          p.map((i) => (i.id === id ? { ...i, sharedWith } : i))
        );
      }
    },
    [allItems]
  );

  const importItems = useCallback(
    async (list: Array<Omit<VaultItem, 'id' | 'createdAt' | 'updatedAt'>>) => {
      const imported = list.map((data) => ({
        ...data,
        id: `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }));
      for (const item of imported) await db.items.put(item);
      setAllItems((p) => [...imported, ...p]);
    },
    []
  );

  const deleteFolder = useCallback(
    async (id: string) => {
      await db.folders.delete(id);
      setFolders((p) => p.filter((f) => f.id !== id));
      const orphaned = allItems.filter((i) => i.folderId === id);
      for (const item of orphaned) {
        const updated = { ...item, folderId: undefined };
        await db.items.put(updated);
      }
      if (orphaned.length > 0) {
        const ids = new Set(orphaned.map((i) => i.id));
        setAllItems((p) =>
          p.map((i) => (ids.has(i.id) ? { ...i, folderId: undefined } : i))
        );
      }
    },
    [allItems]
  );

  const updateSettings = useCallback(
    async (partial: Partial<Settings>) => {
      const updated = { ...settings, ...partial };
      await db.settings.put(updated);
      setSettings(updated);
    },
    [settings]
  );

  const requestEmergencyAccess = useCallback(
    async (email: string, delayMinutes: number) => {
      await updateSettings({
        emergencyContact: { email, delayMinutes },
        emergencyRequest: { requestedAt: Date.now(), delayMinutes },
      });
    },
    [updateSettings]
  );

  const cancelEmergencyRequest = useCallback(async () => {
    await updateSettings({ emergencyRequest: undefined });
  }, [updateSettings]);

  return (
    <DataContext.Provider
      value={{
        items,
        trashedItems,
        folders,
        settings,
        isLoading,
        currentItem,
        setCurrentItem,
        createItem,
        updateItem,
        deleteItem,
        trashItem,
        restoreItem,
        duplicateItem,
        touchItem,
        toggleFavorite,
        createFolder,
        renameFolder,
        deleteFolder,
        toggleFolderTeam,
        shareItem,
        revokeShare,
        logAccess,
        importItems,
        updateSettings,
        requestEmergencyAccess,
        cancelEmergencyRequest,
        refreshData,
      }}>
      {children}
    </DataContext.Provider>
  );
};
