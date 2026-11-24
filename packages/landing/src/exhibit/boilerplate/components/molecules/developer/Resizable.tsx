'use client';

import type { FC, ReactNode } from 'react';
import { useCallback, useRef, useState } from 'react';

interface ResizableProps {
  direction?: 'horizontal' | 'vertical';
  initialRatio?: number;
  minRatio?: number;
  maxRatio?: number;
  first: ReactNode;
  second: ReactNode;
  className?: string;
}

export const Resizable: FC<ResizableProps> = ({
  direction = 'horizontal',
  initialRatio = 0.5,
  minRatio = 0.2,
  maxRatio = 0.8,
  first,
  second,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(
    Math.min(Math.max(initialRatio, minRatio), maxRatio)
  );
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const container = containerRef.current;
      if (!container || !dragging) return;
      const bounds = container.getBoundingClientRect();
      const offset =
        direction === 'horizontal'
          ? e.clientX - bounds.left
          : e.clientY - bounds.top;
      const next = Math.min(
        Math.max(
          offset / (direction === 'horizontal' ? bounds.width : bounds.height),
          minRatio
        ),
        maxRatio
      );
      setRatio(next);
    },
    [direction, dragging, minRatio, maxRatio]
  );

  const onPointerUp = useCallback(() => setDragging(false), []);

  const splitClass =
    direction === 'horizontal'
      ? 'flex-row items-stretch'
      : 'flex-col items-stretch';

  return (
    <div
      ref={containerRef}
      className={`relative flex w-full overflow-hidden ${splitClass} ${className}`}>
      <div
        className={direction === 'horizontal' ? 'min-w-0' : 'min-h-0'}
        style={{
          width: direction === 'horizontal' ? `${ratio * 100}%` : undefined,
          height: direction === 'vertical' ? `${ratio * 100}%` : undefined,
        }}>
        {first}
      </div>
      <div
        role="separator"
        aria-orientation={direction}
        className={`${
          direction === 'horizontal'
            ? 'w-1.5 cursor-col-resize'
            : 'h-1.5 cursor-row-resize'
        } bg-base-200 hover:bg-primary shrink-0 touch-none transition-colors`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      <div className="min-w-0 flex-1">{second}</div>
    </div>
  );
};

Resizable.displayName = 'Resizable';
