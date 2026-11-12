const DB_NAME = 'wallet-db';
const DB_VERSION = 2;
const MOCK_DELAY = Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? '800');

const STORES = {
  accounts: 'accounts',
  transactions: 'transactions',
  cards: 'cards',
  recurringBills: 'recurringBills',
  notifications: 'notifications',
  budgetCategories: 'budgetCategories',
  currencyRates: 'currencyRates',
  user: 'user',
  contacts: 'contacts',
  paymentRequests: 'paymentRequests',
  recurringTransfers: 'recurringTransfers',
  currencyAlerts: 'currencyAlerts',
  loans: 'loans',
  fixedDeposits: 'fixedDeposits',
  recurringDeposits: 'recurringDeposits',
  savingsGoals: 'savingsGoals',
  insurance: 'insurance',
  cardRewards: 'cardRewards',
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const openDB = (): Promise<IDBDatabase> => {
  console.log('[db] openDB', { DB_NAME, DB_VERSION });
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('[db] openDB error', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('[db] openDB success');
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      console.log('[db] onupgradeneeded', { stores: Object.values(STORES) });
      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };
  });
};

const getAll = async <T>(storeName: StoreName): Promise<T[]> => {
  console.log('[db] getAll', storeName);
  await delay(MOCK_DELAY);
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => {
      console.log('[db] getAll result', storeName, request.result.length);
      resolve(request.result as T[]);
    };
    request.onerror = () => {
      console.error('[db] getAll error', storeName, request.error);
      reject(request.error);
    };
  });
};

const put = async <T>(storeName: StoreName, data: T): Promise<void> => {
  console.log('[db] put', storeName, data);
  await delay(MOCK_DELAY);
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(data);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('[db] put error', storeName, request.error);
      reject(request.error);
    };
  });
};

const putAll = async (storeName: StoreName, data: object[]): Promise<void> => {
  console.log('[db] putAll', storeName, data.length);
  await delay(MOCK_DELAY);
  const database = await openDB();
  const valid = data.filter((item) => {
    if (item == null || (item as Record<string, unknown>).id == null) {
      console.warn('[db] putAll skipping item without id', storeName, item);
      return false;
    }
    return true;
  });
  if (valid.length === 0) return;
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    valid.forEach((item) => {
      try {
        store.put(item);
      } catch (err) {
        console.warn('[db] putAll item failed', storeName, item, err);
      }
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => {
      console.error('[db] putAll error', storeName, tx.error);
      reject(tx.error);
    };
  });
};

const count = async (storeName: StoreName): Promise<number> => {
  console.log('[db] count', storeName);
  await delay(MOCK_DELAY);
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.count();
    request.onsuccess = () => {
      console.log('[db] count result', storeName, request.result);
      resolve(request.result);
    };
    request.onerror = () => {
      console.error('[db] count error', storeName, request.error);
      reject(request.error);
    };
  });
};

const needsSeed = async (): Promise<boolean> => {
  console.log('[db] needsSeed check');
  const userCount = await count(STORES.user);
  const needs = userCount === 0;
  console.log('[db] needsSeed', { userCount, needs });
  return needs;
};

const remove = async (storeName: StoreName, id: string): Promise<void> => {
  console.log('[db] remove', storeName, id);
  await delay(MOCK_DELAY);
  const database = await openDB();
  return new Promise((resolve, reject) => {
    const tx = database.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error('[db] remove error', storeName, request.error);
      reject(request.error);
    };
  });
};

export const db = {
  open: openDB,
  getAll,
  put,
  putAll,
  remove,
  count,
  needsSeed,
  STORES,
};
