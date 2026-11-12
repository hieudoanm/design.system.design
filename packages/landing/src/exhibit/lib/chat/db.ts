import { openDB, type IDBPDatabase } from 'idb';
import type {
  User,
  Contact,
  Chat,
  Message,
  AppSettings,
  AuthSession,
} from '@/exhibit/types/chat';

const DB_NAME = 'messaging-db';
const DB_VERSION = 1;

const getMockDelay = (): number => {
  if (typeof window === 'undefined') return 0;
  const delay = process.env.NEXT_PUBLIC_MOCK_DELAY;
  return delay ? parseInt(delay, 10) : 500;
};

const mockDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const getDB = (): Promise<IDBPDatabase> =>
  openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('account')) {
        db.createObjectStore('account', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('contacts')) {
        db.createObjectStore('contacts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('chats')) {
        db.createObjectStore('chats', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('messages')) {
        const store = db.createObjectStore('messages', { keyPath: 'id' });
        store.createIndex('chatId', 'chatId');
      }
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('auth')) {
        db.createObjectStore('auth', { keyPath: 'id' });
      }
    },
  });

export const db = {
  account: {
    get: async (): Promise<User | undefined> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.get('account', 'me');
    },
    getAll: async (): Promise<User[]> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.getAll('account');
    },
    put: async (user: User): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.put('account', { ...user, id: 'me' });
    },
  },
  contacts: {
    getAll: async (): Promise<Contact[]> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.getAll('contacts');
    },
    put: async (contact: Contact): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.put('contacts', contact);
    },
  },
  chats: {
    getAll: async (): Promise<Chat[]> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.getAll('chats');
    },
    get: async (id: string): Promise<Chat | undefined> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.get('chats', id);
    },
    put: async (chat: Chat): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.put('chats', chat);
    },
  },
  messages: {
    getAll: async (): Promise<Message[]> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.getAll('messages');
    },
    getByChat: async (chatId: string): Promise<Message[]> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      const index = database.transaction('messages').store.index('chatId');
      return index.getAll(chatId);
    },
    get: async (id: string): Promise<Message | undefined> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.get('messages', id);
    },
    put: async (message: Message): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.put('messages', message);
    },
  },
  settings: {
    get: async (): Promise<AppSettings> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      const settings = await database.get('settings', 'default');
      return (
        settings ?? {
          id: 'default',
          theme: 'exibit-light',
          notifications: true,
          readReceipts: true,
          typingIndicators: true,
          disappearingSeconds: 0,
        }
      );
    },
    put: async (settings: AppSettings): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.put('settings', { ...settings, id: 'default' });
    },
  },
  auth: {
    get: async (): Promise<AuthSession | undefined> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      return database.get('auth', 'session');
    },
    put: async (session: AuthSession): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.put('auth', { ...session, id: 'session' });
    },
    delete: async (): Promise<void> => {
      await mockDelay(getMockDelay());
      const database = await getDB();
      await database.delete('auth', 'session');
    },
  },
};
