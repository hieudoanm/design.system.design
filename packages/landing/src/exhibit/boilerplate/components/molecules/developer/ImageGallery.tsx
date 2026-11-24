'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface GalleryImage {
  src: string;
  alt: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  label?: string;
}

export const ImageGallery: FC<ImageGalleryProps> = ({
  images,
  label = 'Image gallery',
}) => {
  const [active, setActive] = useState(0);

  if (images.length === 0) return null;

  const current = images[Math.min(active, images.length - 1)];

  return (
    <div className="flex w-full flex-col gap-3" aria-label={label}>
      <div className="bg-base-200 border-base-content/10 flex h-64 items-center justify-center overflow-hidden rounded-2xl border">
        <img
          src={current.src}
          alt={current.alt}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex gap-2">
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show ${image.alt}`}
            aria-pressed={index === active}
            className={`h-14 w-14 overflow-hidden rounded-lg border-2 transition-colors ${
              index === active ? 'border-primary' : 'border-transparent'
            }`}
            onClick={() => setActive(index)}>
            <img
              src={image.src}
              alt=""
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
};
