import { type FC } from 'react';
import Link from 'next/link';
import { FiStar, FiX } from 'react-icons/fi';
import type { Photo } from '@/exhibit/types/gallery';
import { PhotoThumb } from '@/exhibit/components/gallery/atoms/PhotoThumb';

interface PhotoTileProps {
  photo: Photo;
  onToggleFavorite?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const PhotoTile: FC<PhotoTileProps> = ({
  photo,
  onToggleFavorite,
  onRemove,
}) => (
  <Link
    href={`/design-system/exhibits/gallery`}
    aria-label={photo.name}
    className="group relative block aspect-square overflow-hidden rounded-lg">
    <PhotoThumb photo={photo} className="h-full w-full" />
    {onRemove && (
      <button
        type="button"
        aria-label={`Remove ${photo.name}`}
        onClick={(e) => {
          e.preventDefault();
          onRemove(photo.id);
        }}
        className="absolute top-1.5 left-1.5 rounded-full bg-black/30 p-1.5">
        <FiX className="size-3.5 text-white" />
      </button>
    )}
    {onToggleFavorite && (
      <button
        type="button"
        aria-label={`Favorite ${photo.name}`}
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite(photo.id);
        }}
        className="absolute top-1.5 right-1.5 rounded-full bg-black/30 p-1.5">
        <FiStar
          className={`size-3.5 ${
            photo.favorite ? 'fill-warning text-warning' : 'text-white'
          }`}
        />
      </button>
    )}
  </Link>
);
