'use client';

import type { CSSProperties, FC, PointerEvent, ReactNode } from 'react';
import { useRef } from 'react';

interface SpotlightProps {
  children: ReactNode;
  className?: string;
}

export const Spotlight: FC<SpotlightProps> = ({ children, className = '' }) => {
  const ref = useRef<HTMLDivElement>(null);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    element.style.setProperty('--x', `${event.clientX - bounds.left}px`);
    element.style.setProperty('--y', `${event.clientY - bounds.top}px`);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={`group relative overflow-hidden ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={
          {
            background:
              'radial-gradient(600px circle at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.12), transparent 40%)',
          } as CSSProperties
        }
      />
      {children}
    </div>
  );
};

Spotlight.displayName = 'Spotlight';
