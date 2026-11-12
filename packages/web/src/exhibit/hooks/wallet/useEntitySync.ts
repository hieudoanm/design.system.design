'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/exhibit/lib/wallet/db';
import { ensureSeeded } from '@/exhibit/lib/wallet/seed';

export const useEntitySync = <T extends object>(
  storeName: string,
  seedData: T[]
) => {
  const [data, setData] = useState<T[]>(seedData);
  const [loading, setLoading] = useState(true);

  console.log(`[useEntitySync:${storeName}] init`);

  useEffect(() => {
    const sync = async () => {
      console.log(`[useEntitySync:${storeName}] sync start`);
      try {
        await ensureSeeded();
        const items = await db.getAll<T>(storeName as never);
        console.log(`[useEntitySync:${storeName}] loaded`, items.length);
        if (items.length) setData(items);
      } catch (err) {
        console.warn(`[useEntitySync:${storeName}] sync failed`, err);
      } finally {
        setLoading(false);
      }
    };
    sync();
  }, [storeName]);

  const persist = useCallback(
    async (items: T[]) => {
      try {
        await db.putAll(storeName as never, items);
      } catch (err) {
        console.warn(`[useEntitySync:${storeName}] persist failed`, err);
      }
    },
    [storeName]
  );

  const persistOne = useCallback(
    async (item: T) => {
      try {
        await db.put(storeName as never, item);
      } catch (err) {
        console.warn(`[useEntitySync:${storeName}] persistOne failed`, err);
      }
    },
    [storeName]
  );

  return { data, setData, loading, persist, persistOne };
};
