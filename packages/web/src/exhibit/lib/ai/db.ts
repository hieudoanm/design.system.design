import { openDB, type IDBPDatabase } from 'idb';
import type { Conversation, Message, Folder, Settings } from '@/exhibit/types/ai';

const DB_NAME = 'ai-chat-db';
const DB_VERSION = 1;

const getMockDelay = (): number => {
  if (typeof window === 'undefined') return 0;
  const delay = process.env.NEXT_PUBLIC_MOCK_DELAY;
  return delay ? parseInt(delay, 10) : 800;
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getDB = (): Promise<IDBPDatabase> =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('conversations')) {
        db.createObjectStore('conversations', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const messageStore = db.createObjectStore('messages', {
          keyPath: 'id',
        });
        messageStore.createIndex('conversationId', 'conversationId');
      }
      if (!db.objectStoreNames.contains('folders')) {
        db.createObjectStore('folders', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    },
  });

export const db = {
  conversations: {
    getAll: async (): Promise<Conversation[]> => {
      await delay(getMockDelay());
      const database = await getDB();
      return database.getAll('conversations');
    },
    get: async (id: string): Promise<Conversation | undefined> => {
      await delay(getMockDelay());
      const database = await getDB();
      return database.get('conversations', id);
    },
    put: async (conversation: Conversation): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.put('conversations', conversation);
    },
    delete: async (id: string): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.delete('conversations', id);
    },
  },
  messages: {
    getAll: async (): Promise<Message[]> => {
      await delay(getMockDelay());
      const database = await getDB();
      return database.getAll('messages');
    },
    getByConversation: async (conversationId: string): Promise<Message[]> => {
      await delay(getMockDelay());
      const database = await getDB();
      const index = database
        .transaction('messages')
        .store.index('conversationId');
      return index.getAll(conversationId);
    },
    get: async (id: string): Promise<Message | undefined> => {
      await delay(getMockDelay());
      const database = await getDB();
      return database.get('messages', id);
    },
    put: async (message: Message): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.put('messages', message);
    },
    delete: async (id: string): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.delete('messages', id);
    },
    deleteByConversation: async (conversationId: string): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      const tx = database.transaction('messages', 'readwrite');
      const index = tx.store.index('conversationId');
      const keys = await index.getAllKeys(conversationId);
      await Promise.all(keys.map((key) => tx.store.delete(key)));
      await tx.done;
    },
  },
  folders: {
    getAll: async (): Promise<Folder[]> => {
      await delay(getMockDelay());
      const database = await getDB();
      return database.getAll('folders');
    },
    put: async (folder: Folder): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.put('folders', folder);
    },
    delete: async (id: string): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.delete('folders', id);
    },
  },
  settings: {
    get: async (): Promise<Settings> => {
      await delay(getMockDelay());
      const database = await getDB();
      const settings = await database.get('settings', 'default');
      return (
        settings ?? {
          id: 'default',
          theme: 'exibit-light',
          defaultModel: 'gpt-4o',
          systemPrompt: '',
          mockDelay: 800,
        }
      );
    },
    put: async (settings: Settings): Promise<void> => {
      await delay(getMockDelay());
      const database = await getDB();
      await database.put('settings', { id: 'default', ...settings });
    },
  },
};
