export interface Photo {
  id: string;
  name: string;
  type: string;
  width: number;
  height: number;
  size: number;
  color: string;
  tags: string[];
  favorite: boolean;
  albumId: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface Album {
  id: string;
  name: string;
  coverId: string | null;
  photoIds: string[];
  createdAt: number;
  updatedAt: number;
}

export type SortField = 'date' | 'name' | 'size';

export type GalleryTab = 'photos' | 'albums' | 'search';

export interface GalleryView {
  sort: SortField;
  query: string;
}
