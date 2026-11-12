import type { Album, Photo, SortField } from '@/exhibit/types/gallery';

export const filterPhotos = (photos: Photo[], query: string): Photo[] => {
  const q = query.trim().toLowerCase();
  if (!q) return photos;
  return photos.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q))
  );
};

export const sortPhotos = (photos: Photo[], field: SortField): Photo[] => {
  const copy = [...photos];
  if (field === 'name')
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  if (field === 'size') return copy.sort((a, b) => b.size - a.size);
  return copy.sort((a, b) => b.updatedAt - a.updatedAt);
};

export const selectPhotos = (
  photos: Photo[],
  query: string,
  field: SortField
): Photo[] => sortPhotos(filterPhotos(photos, query), field);

export const photosInAlbum = (photos: Photo[], album: Album): Photo[] =>
  album.photoIds
    .map((id) => photos.find((p) => p.id === id))
    .filter((p): p is Photo => Boolean(p));

export const albumCover = (photos: Photo[], album: Album): Photo | undefined =>
  photos.find((p) => p.id === album.coverId) ??
  photos.find((p) => p.id === album.photoIds[0]);

export const allTags = (photos: Photo[]): string[] =>
  [...new Set(photos.flatMap((p) => p.tags))].sort();
