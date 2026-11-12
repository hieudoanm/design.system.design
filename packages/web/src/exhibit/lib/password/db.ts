import { openDB, type IDBPDatabase } from 'idb';
import type { VaultItem, Folder, Settings } from '@/exhibit/types/password';

const DB_NAME = 'password-db';
const DB_VERSION = 1;
const getMockDelay = (): number => {
  if (typeof window === 'undefined') return 0;
  return process.env.NEXT_PUBLIC_MOCK_DELAY
    ? parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY, 10)
    : 800;
};
const delay = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));
const getDB = (): Promise<IDBPDatabase> =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('items'))
        db.createObjectStore('items', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('folders'))
        db.createObjectStore('folders', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('settings'))
        db.createObjectStore('settings', { keyPath: 'id' });
    },
  });

export const db = {
  items: {
    getAll: async (): Promise<VaultItem[]> => {
      await delay(getMockDelay());
      return (await getDB()).getAll('items');
    },
    get: async (id: string): Promise<VaultItem | undefined> => {
      await delay(getMockDelay());
      return (await getDB()).get('items', id);
    },
    put: async (item: VaultItem): Promise<void> => {
      await delay(getMockDelay());
      await (await getDB()).put('items', item);
    },
    delete: async (id: string): Promise<void> => {
      await delay(getMockDelay());
      await (await getDB()).delete('items', id);
    },
  },
  folders: {
    getAll: async (): Promise<Folder[]> => {
      await delay(getMockDelay());
      return (await getDB()).getAll('folders');
    },
    put: async (f: Folder): Promise<void> => {
      await delay(getMockDelay());
      await (await getDB()).put('folders', f);
    },
    delete: async (id: string): Promise<void> => {
      await delay(getMockDelay());
      await (await getDB()).delete('folders', id);
    },
  },
  settings: {
    get: async (): Promise<Settings> => {
      await delay(getMockDelay());
      const s = await (await getDB()).get('settings', 'default');
      return (
        s ?? {
          id: 'default',
          theme: 'password-light',
          autoLockTimeout: 5,
          clipboardClear: 30,
          biometricEnabled: false,
          lockOnClose: false,
        }
      );
    },
    put: async (s: Settings): Promise<void> => {
      await delay(getMockDelay());
      await (await getDB()).put('settings', { id: 'default', ...s });
    },
  },
};
