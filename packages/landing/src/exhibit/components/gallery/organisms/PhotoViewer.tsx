'use client';

import { type FC } from 'react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCalendar,
  FiMaximize,
  FiHardDrive,
} from 'react-icons/fi';
import type { Photo } from '@/exhibit/types/gallery';
import { PhotoThumb } from '@/exhibit/components/gallery/atoms/PhotoThumb';
import {
  formatDimensions,
  formatFileSize,
  formatRelativeTime,
} from '@/exhibit/utils/gallery/format';

interface PhotoViewerProps {
  photo: Photo;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export const PhotoViewer: FC<PhotoViewerProps> = ({
  photo,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
}) => (
  <article className="flex h-full flex-col">
    <div className="relative flex flex-1 items-center justify-center p-4">
      <button
        type="button"
        aria-label="Previous photo"
        disabled={!hasPrev}
        onClick={onPrev}
        className="btn btn-ghost btn-sm btn-circle absolute left-1 z-10 disabled:opacity-20">
        <FiChevronLeft className="size-5" />
      </button>
      <PhotoThumb
        photo={photo}
        showName
        className="max-h-full w-full rounded-xl"
      />
      <button
        type="button"
        aria-label="Next photo"
        disabled={!hasNext}
        onClick={onNext}
        className="btn btn-ghost btn-sm btn-circle absolute right-1 z-10 disabled:opacity-20">
        <FiChevronRight className="size-5" />
      </button>
    </div>
    <div className="border-base-300 shrink-0 space-y-3 border-t p-4">
      <div>
        <h2 className="truncate text-sm font-semibold">{photo.name}</h2>
        <p className="text-base-content/50 text-xs">
          {formatRelativeTime(photo.updatedAt)}
        </p>
      </div>
      <div className="text-base-content/70 grid grid-cols-3 gap-2 text-[11px]">
        <span className="flex items-center gap-1">
          <FiMaximize className="size-3.5" />
          {formatDimensions(photo.width, photo.height)}
        </span>
        <span className="flex items-center gap-1">
          <FiHardDrive className="size-3.5" />
          {formatFileSize(photo.size)}
        </span>
        <span className="flex items-center gap-1">
          <FiCalendar className="size-3.5" />
          {photo.type.replace('image/', '').toUpperCase()}
        </span>
      </div>
      {photo.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {photo.tags.map((tag) => (
            <span key={tag} className="badge badge-ghost badge-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </article>
);
