'use client';

import { useCallback, useEffect, useState } from 'react';
import { db } from '@/exhibit/lib/tax/db';

const MOCK_DELAY = Number(process.env.NEXT_PUBLIC_MOCK_DELAY ?? '800');

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

interface UseEntitySyncReturn<T> {
  data: T[];
  loading: boolean;
  setData: (data: T[]) => void;
  persist: (items: T[]) => Promise<void>;
  persistOne: (item: T) => Promise<void>;
  removeOne: (id: string) => Promise<void>;
}

export const useEntitySync = <T extends { id: string }>(
  storeName: (typeof db.STORES)[keyof typeof db.STORES],
  initialData: T[] = []
): UseEntitySyncReturn<T> => {
  const [data, setData] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        console.log('[useEntitySync] loading', storeName);
        const items = await db.getAll<T>(storeName);
        if (!cancelled) {
          setData(items.length > 0 ? items : initialData);
          setLoading(false);
        }
      } catch (err) {
        console.error('[useEntitySync] load error', storeName, err);
        if (!cancelled) {
          setData(initialData);
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [storeName]);

  const persist = useCallback(
    async (items: T[]) => {
      console.log('[useEntitySync] persist', storeName, items.length);
      await delay(MOCK_DELAY);
      await db.putAll(storeName, items);
      setData(items);
    },
    [storeName]
  );

  const persistOne = useCallback(
    async (item: T) => {
      console.log('[useEntitySync] persistOne', storeName, item);
      await delay(MOCK_DELAY);
      await db.put(storeName, item);
      setData((prev) => {
        const idx = prev.findIndex((p) => p.id === item.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = item;
          return next;
        }
        return [...prev, item];
      });
    },
    [storeName]
  );

  const removeOne = useCallback(
    async (id: string) => {
      console.log('[useEntitySync] removeOne', storeName, id);
      await delay(MOCK_DELAY);
      await db.remove(storeName, id);
      setData((prev) => prev.filter((p) => p.id !== id));
    },
    [storeName]
  );

  return { data, loading, setData, persist, persistOne, removeOne };
};
