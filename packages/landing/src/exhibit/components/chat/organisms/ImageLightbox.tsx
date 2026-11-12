'use client';

import { type FC, useState, useCallback, useEffect } from 'react';
import {
  FaTimes,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';

interface ImageLightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageLightbox: FC<ImageLightboxProps> = ({
  images,
  initialIndex,
  onClose,
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length);
    setScale(1);
  }, [images.length]);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length);
    setScale(1);
  }, [images.length]);

  const toggleZoom = useCallback(() => {
    setScale((s) => (s === 1 ? 2 : 1));
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, prev, next]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90"
      onClick={onClose}
      role="dialog"
      aria-label="Image lightbox">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="btn btn-circle btn-sm btn-ghost absolute top-4 right-4 text-white">
        <FaTimes aria-hidden="true" />
      </button>
      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            aria-label="Previous image"
            className="btn btn-circle btn-sm btn-ghost absolute left-4 text-white">
            <FaChevronLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            aria-label="Next image"
            className="btn btn-circle btn-sm btn-ghost absolute right-14 text-white">
            <FaChevronRight aria-hidden="true" />
          </button>
        </>
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleZoom();
        }}
        aria-label={scale > 1 ? 'Zoom out' : 'Zoom in'}
        className="btn btn-circle btn-sm btn-ghost absolute bottom-4 text-white">
        {scale > 1 ? (
          <FaCompress aria-hidden="true" />
        ) : (
          <FaExpand aria-hidden="true" />
        )}
      </button>
      <img
        src={images[index]}
        alt={`Image ${index + 1} of ${images.length}`}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain transition-transform"
        style={{ transform: `scale(${scale})` }}
      />
      {images.length > 1 && (
        <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">
          {index + 1} / {images.length}
        </span>
      )}
    </div>
  );
};
