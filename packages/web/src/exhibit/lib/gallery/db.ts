import { openDB, type IDBPDatabase } from 'idb';
import type { Album, Photo } from '@/exhibit/types/gallery';

const DB_NAME = 'gallery-db';
const DB_VERSION = 1;

const getMockDelay = (): number => {
  if (typeof window === 'undefined') return 0;
  return process.env.NEXT_PUBLIC_MOCK_DELAY
    ? parseInt(process.env.NEXT_PUBLIC_MOCK_DELAY, 10)
    : 600;
};

const delay = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, getMockDelay()));

interface GalleryDB {
  photos: { key: string; value: Photo };
  albums: { key: string; value: Album };
}

const getDB = (): Promise<IDBPDatabase<GalleryDB>> =>
  openDB<GalleryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('photos'))
        db.createObjectStore('photos', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('albums'))
        db.createObjectStore('albums', { keyPath: 'id' });
    },
  });

export const db = {
  photos: {
    getAll: async (): Promise<Photo[]> => {
      await delay();
      return (await getDB()).getAll('photos');
    },
    get: async (id: string): Promise<Photo | undefined> => {
      await delay();
      return (await getDB()).get('photos', id);
    },
    put: async (photo: Photo): Promise<void> => {
      await delay();
      await (await getDB()).put('photos', photo);
    },
    delete: async (id: string): Promise<void> => {
      await delay();
      await (await getDB()).delete('photos', id);
    },
  },
  albums: {
    getAll: async (): Promise<Album[]> => {
      await delay();
      return (await getDB()).getAll('albums');
    },
    get: async (id: string): Promise<Album | undefined> => {
      await delay();
      return (await getDB()).get('albums', id);
    },
    put: async (album: Album): Promise<void> => {
      await delay();
      await (await getDB()).put('albums', album);
    },
    delete: async (id: string): Promise<void> => {
      await delay();
      await (await getDB()).delete('albums', id);
    },
  },
};
