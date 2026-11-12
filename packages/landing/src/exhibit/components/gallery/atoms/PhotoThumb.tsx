import { type FC } from 'react';
import { FiImage } from 'react-icons/fi';
import type { Photo } from '@/exhibit/types/gallery';
import { gradientFor } from '@/exhibit/utils/gallery/format';

interface PhotoThumbProps {
  photo: Photo;
  className?: string;
  showName?: boolean;
}

export const PhotoThumb: FC<PhotoThumbProps> = ({
  photo,
  className = '',
  showName = false,
}) => (
  <div
    data-testid={`photo-thumb-${photo.id}`}
    className={`relative overflow-hidden ${className}`}
    style={{ background: gradientFor(photo.color) }}>
    <div className="flex h-full w-full items-center justify-center">
      <FiImage className="size-8 text-white/35" />
    </div>
    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
    {showName && (
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="truncate text-xs font-medium text-white drop-shadow">
          {photo.name}
        </p>
      </div>
    )}
  </div>
);
