'use client';

import { useRef } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface CarouselProps {
  slides: ReactNode[];
  ariaLabel?: string;
}

export const Carousel: FC<CarouselProps> = ({
  slides,
  ariaLabel = 'Carousel',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'prev' | 'next') => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth || 0;
    track.scrollBy?.({
      left: direction === 'next' ? amount : -amount,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full">
      <div
        ref={trackRef}
        aria-label={ariaLabel}
        className="carousel carousel-start rounded-box w-full gap-2 overflow-x-auto">
        {slides.map((slide, index) => (
          <div key={index} className="carousel-item w-full">
            {slide}
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          aria-label="Previous slide"
          className="btn btn-circle btn-sm"
          onClick={() => scroll('prev')}>
          <FiChevronLeft />
        </button>
        <button
          type="button"
          aria-label="Next slide"
          className="btn btn-circle btn-sm"
          onClick={() => scroll('next')}>
          <FiChevronRight />
        </button>
      </div>
    </div>
  );
};
