'use client';

import { type FC, useRef, useState } from 'react';
import { FiCamera, FiImage, FiUpload } from 'react-icons/fi';
import { Providers } from '@/exhibit/providers/gallery/Providers';
import { useData } from '@/exhibit/providers/gallery/DataProvider';
import { useToast } from '@/exhibit/providers/gallery/ToastProvider';
import { PhoneFrame } from '@/exhibit/components/gallery/organisms/PhoneFrame';
import { CameraCapture } from '@/exhibit/components/gallery/molecules/CameraCapture';
import { EmptyState } from '@/exhibit/components/gallery/molecules/EmptyState';
import { PhotoTile } from '@/exhibit/components/gallery/molecules/PhotoTile';
import { COLOR_PALETTE } from '@/exhibit/data/gallery/models';
import { sortPhotos } from '@/exhibit/lib/gallery/selectors';
import type { SortField } from '@/exhibit/types/gallery';

const NEXT_PHOTO = { width: 1920, height: 1080, size: 2000000 };

const PhotosContent: FC = () => {
  const { photos, isLoading, toggleFavorite, createPhoto } = useData();
  const { addToast } = useToast();
  const [sort, setSort] = useState<SortField>('date');
  const [showCamera, setShowCamera] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const favorites = photos.filter((p) => p.favorite).slice(0, 10);
  const sorted = sortPhotos(photos, sort);
  const nextColor = COLOR_PALETTE[photos.length % COLOR_PALETTE.length];

  const upload = async (file: File) => {
    await createPhoto({
      name: file.name.replace(/\.[^.]+$/, '') || `Photo ${photos.length + 1}`,
      type: file.type || 'image/jpeg',
      ...NEXT_PHOTO,
      size: file.size || NEXT_PHOTO.size,
      color: nextColor,
      tags: ['upload'],
      favorite: false,
      albumId: null,
    });
    addToast('Photo uploaded', 'success');
  };

  const capture = async () => {
    await createPhoto({
      name: `Capture ${photos.length + 1}`,
      type: 'image/jpeg',
      width: 1080,
      height: 1920,
      size: 1800000,
      color: nextColor,
      tags: ['camera'],
      favorite: false,
      albumId: null,
    });
    setShowCamera(false);
    addToast('Photo captured', 'success');
  };

  return (
    <PhoneFrame
      title="Photos"
      actions={
        <>
          <button
            type="button"
            aria-label="Take photo"
            onClick={() => setShowCamera(true)}
            className="btn btn-ghost btn-sm btn-circle">
            <FiCamera className="size-4" />
          </button>
          <button
            type="button"
            aria-label="Upload photo"
            onClick={() => fileRef.current?.click()}
            className="btn btn-primary btn-sm btn-circle">
            <FiUpload className="size-4" />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            data-testid="upload-input"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload(file);
              e.target.value = '';
            }}
          />
        </>
      }>
      <div className="space-y-4 p-4">
        {favorites.length > 0 && (
          <section>
            <h2 className="text-base-content/60 mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase">
              Favorites
            </h2>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {favorites.map((photo) => (
                <div key={photo.id} className="w-24 shrink-0">
                  <PhotoTile photo={photo} />
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-base-content/60 flex items-center gap-1.5 text-xs font-semibold uppercase">
              <FiImage className="size-3.5" /> All Photos
            </h2>
            <select
              aria-label="Sort photos"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortField)}
              className="select select-xs rounded-full">
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="size">Largest</option>
            </select>
          </div>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-1">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="skeleton aspect-square rounded-lg" />
              ))}
            </div>
          ) : sorted.length > 0 ? (
            <div className="grid grid-cols-3 gap-1">
              {sorted.map((photo) => (
                <PhotoTile
                  key={photo.id}
                  photo={photo}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No photos yet"
              hint="Upload or capture a photo to get started"
            />
          )}
        </section>
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={capture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </PhoneFrame>
  );
};

const GalleryPage: FC = () => (
  <Providers>
    <PhotosContent />
  </Providers>
);

export default GalleryPage;
