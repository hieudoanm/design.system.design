'use client';

import type { CSSProperties, FC, PointerEvent, ReactNode } from 'react';
import { useRef, useState } from 'react';

interface MagneticProps {
  children: ReactNode;
  strength?: number;
  className?: string;
}

export const Magnetic: FC<MagneticProps> = ({
  children,
  strength = 12,
  className = '',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const element = ref.current;
    if (!element) return;
    const bounds = element.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const scaleX = bounds.width > 0 ? strength / bounds.width : 0;
    const scaleY = bounds.height > 0 ? strength / bounds.height : 0;
    setOffset({ x: x * scaleX * 2, y: y * scaleY * 2 });
  };

  const reset = () => setOffset({ x: 0, y: 0 });

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      className={`inline-block transition-transform duration-200 ${className}`}
      style={
        {
          transform: `translate(${offset.x}px, ${offset.y}px)`,
        } as CSSProperties
      }>
      {children}
    </div>
  );
};

Magnetic.displayName = 'Magnetic';
