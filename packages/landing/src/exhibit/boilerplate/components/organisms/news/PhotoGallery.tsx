'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface Photo {
  imageAlt: string;
  caption: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  title?: string;
}

export const PhotoGallery: FC<PhotoGalleryProps> = ({
  photos,
  title = 'Photo Gallery',
}) => {
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected !== null ? photos[selected] : undefined;

  return (
    <section data-testid="photo-gallery" className="flex w-full flex-col gap-4">
      <h2>{title}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={index}
            type="button"
            data-testid={`gallery-photo-${index}`}
            aria-label={`Open photo: ${photo.caption}`}
            onClick={() => setSelected(index)}
            className="from-primary to-secondary group flex h-32 items-center justify-center rounded-xl bg-gradient-to-br">
            <span className="text-4xl" aria-hidden="true">
              {'\u{1F4F7}'}
            </span>
            <span className="sr-only">{photo.imageAlt}</span>
          </button>
        ))}
      </div>
      {active && (
        <div
          data-testid="photo-lightbox"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelected(null)}>
          <div
            className="card bg-base-100 w-full max-w-lg"
            onClick={(event) => event.stopPropagation()}>
            <figure className="from-primary to-secondary h-64 w-full bg-gradient-to-br" />
            <div className="card-body">
              <h3 className="card-title">{active.caption}</h3>
              <p className="text-base-content/60 text-sm">{active.imageAlt}</p>
              <button
                type="button"
                data-testid="photo-lightbox-close"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelected(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
