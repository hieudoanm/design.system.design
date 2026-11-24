'use client';

import type { CSSProperties, FC, PointerEvent } from 'react';
import { useRef, useState } from 'react';

interface ImageComparisonProps {
  before: string;
  beforeAlt: string;
  after: string;
  afterAlt: string;
  initial?: number;
  className?: string;
}

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

export const ImageComparison: FC<ImageComparisonProps> = ({
  before,
  beforeAlt,
  after,
  afterAlt,
  initial = 50,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(clamp(initial, 0, 100));
  const [dragging, setDragging] = useState(false);

  const update = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const bounds = container.getBoundingClientRect();
    if (bounds.width === 0) return;
    const next = ((clientX - bounds.left) / bounds.width) * 100;
    setPosition(clamp(next, 0, 100));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
    update(event.clientX);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (dragging) update(event.clientX);
  };

  const handlePointerUp = () => setDragging(false);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative overflow-hidden select-none ${className}`}>
      <img
        src={after}
        alt={afterAlt}
        draggable={false}
        className="block w-full"
      />
      <img
        src={before}
        alt={beforeAlt}
        draggable={false}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` } as CSSProperties}
      />
      <div
        aria-hidden="true"
        className="bg-base-100/80 pointer-events-none absolute inset-y-0 w-0.5"
        style={{ left: `${position}%` } as CSSProperties}
      />
      <button
        type="button"
        role="slider"
        aria-label="Compare images"
        aria-valuenow={Math.round(position)}
        aria-valuemin={0}
        aria-valuemax={100}
        className="bg-base-100 border-base-content/10 absolute top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full border p-2 shadow-md"
        style={{ left: `${position}%` } as CSSProperties}>
        <span aria-hidden="true">↔</span>
      </button>
    </div>
  );
};

ImageComparison.displayName = 'ImageComparison';
