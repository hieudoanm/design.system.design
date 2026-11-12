import { db } from '@/exhibit/lib/gallery/db';
import { MOCK_ALBUMS, MOCK_PHOTOS } from '@/exhibit/data/gallery/models';

export const seedDatabase = async (): Promise<void> => {
  const existingPhotos = await db.photos.getAll();
  if (existingPhotos.length === 0) {
    for (const photo of MOCK_PHOTOS) await db.photos.put(photo);
  }
  const existingAlbums = await db.albums.getAll();
  if (existingAlbums.length === 0) {
    for (const album of MOCK_ALBUMS) await db.albums.put(album);
  }
};
