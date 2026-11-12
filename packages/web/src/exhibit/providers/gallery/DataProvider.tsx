'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type { Album, Photo } from '@/exhibit/types/gallery';
import { db } from '@/exhibit/lib/gallery/db';
import { seedDatabase } from '@/exhibit/data/gallery/seed';
import { generateId } from '@/exhibit/data/gallery/models';

interface DataContextType {
  photos: Photo[];
  albums: Album[];
  isLoading: boolean;
  currentPhoto: Photo | null;
  setCurrentPhoto: (photo: Photo | null) => void;
  createPhoto: (
    data: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<Photo>;
  updatePhoto: (id: string, updates: Partial<Photo>) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  createAlbum: (name: string) => Promise<Album>;
  renameAlbum: (id: string, name: string) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  addPhotoToAlbum: (photoId: string, albumId: string) => Promise<void>;
  removePhotoFromAlbum: (photoId: string, albumId: string) => Promise<void>;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = (): DataContextType => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [currentPhoto, setCurrentPhoto] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await seedDatabase();
    const [p, a] = await Promise.all([db.photos.getAll(), db.albums.getAll()]);
    setPhotos(p.sort((x, y) => y.updatedAt - x.updatedAt));
    setAlbums(a.sort((x, y) => x.createdAt - y.createdAt));
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const createPhoto = useCallback(
    async (data: Omit<Photo, 'id' | 'createdAt' | 'updatedAt'>) => {
      const photo: Photo = {
        ...data,
        id: generateId(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await db.photos.put(photo);
      setPhotos((prev) => [photo, ...prev]);
      return photo;
    },
    []
  );

  const updatePhoto = useCallback(
    async (id: string, updates: Partial<Photo>) => {
      const photo = photos.find((p) => p.id === id);
      if (!photo) return;
      const updated = { ...photo, ...updates, updatedAt: Date.now() };
      await db.photos.put(updated);
      setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    [photos]
  );

  const deletePhoto = useCallback(
    async (id: string) => {
      await db.photos.delete(id);
      setPhotos((prev) => prev.filter((p) => p.id !== id));
      for (const album of albums) {
        if (!album.photoIds.includes(id)) continue;
        const photoIds = album.photoIds.filter((pid) => pid !== id);
        const updated = {
          ...album,
          photoIds,
          coverId: album.coverId === id ? (photoIds[0] ?? null) : album.coverId,
          updatedAt: Date.now(),
        };
        await db.albums.put(updated);
        setAlbums((prev) => prev.map((a) => (a.id === album.id ? updated : a)));
      }
    },
    [albums]
  );

  const toggleFavorite = useCallback(
    async (id: string) => {
      const photo = photos.find((p) => p.id === id);
      if (!photo) return;
      const updated = {
        ...photo,
        favorite: !photo.favorite,
        updatedAt: Date.now(),
      };
      await db.photos.put(updated);
      setPhotos((prev) => prev.map((p) => (p.id === id ? updated : p)));
    },
    [photos]
  );

  const createAlbum = useCallback(async (name: string) => {
    const album: Album = {
      id: `album-${Date.now()}`,
      name: name.trim(),
      coverId: null,
      photoIds: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await db.albums.put(album);
    setAlbums((prev) => [...prev, album]);
    return album;
  }, []);

  const renameAlbum = useCallback(
    async (id: string, name: string) => {
      const album = albums.find((a) => a.id === id);
      if (!album) return;
      const updated = { ...album, name: name.trim(), updatedAt: Date.now() };
      await db.albums.put(updated);
      setAlbums((prev) => prev.map((a) => (a.id === id ? updated : a)));
    },
    [albums]
  );

  const deleteAlbum = useCallback(
    async (id: string) => {
      await db.albums.delete(id);
      setAlbums((prev) => prev.filter((a) => a.id !== id));
      const affected = photos.filter((p) => p.albumId === id);
      for (const photo of affected) {
        await db.photos.put({ ...photo, albumId: null });
      }
      setPhotos((prev) =>
        prev.map((p) => (p.albumId === id ? { ...p, albumId: null } : p))
      );
    },
    [photos]
  );

  const addPhotoToAlbum = useCallback(
    async (photoId: string, albumId: string) => {
      const album = albums.find((a) => a.id === albumId);
      if (album && !album.photoIds.includes(photoId)) {
        const updated = {
          ...album,
          photoIds: [...album.photoIds, photoId],
          coverId: album.coverId ?? photoId,
          updatedAt: Date.now(),
        };
        await db.albums.put(updated);
        setAlbums((prev) => prev.map((a) => (a.id === albumId ? updated : a)));
      }
      await updatePhoto(photoId, { albumId });
    },
    [albums, updatePhoto]
  );

  const removePhotoFromAlbum = useCallback(
    async (photoId: string, albumId: string) => {
      const album = albums.find((a) => a.id === albumId);
      if (album) {
        const photoIds = album.photoIds.filter((id) => id !== photoId);
        const updated = {
          ...album,
          photoIds,
          coverId:
            album.coverId === photoId ? (photoIds[0] ?? null) : album.coverId,
          updatedAt: Date.now(),
        };
        await db.albums.put(updated);
        setAlbums((prev) => prev.map((a) => (a.id === albumId ? updated : a)));
      }
      await updatePhoto(photoId, { albumId: null });
    },
    [albums, updatePhoto]
  );

  return (
    <DataContext.Provider
      value={{
        photos,
        albums,
        isLoading,
        currentPhoto,
        setCurrentPhoto,
        createPhoto,
        updatePhoto,
        deletePhoto,
        toggleFavorite,
        createAlbum,
        renameAlbum,
        deleteAlbum,
        addPhotoToAlbum,
        removePhotoFromAlbum,
        refreshData,
      }}>
      {children}
    </DataContext.Provider>
  );
};
