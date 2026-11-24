'use client';

import type { CSSProperties, FC } from 'react';
import { useEffect, useState } from 'react';

interface ScrollProgressProps {
  color?: string;
  className?: string;
}

export const ScrollProgress: FC<ScrollProgressProps> = ({
  color = 'bg-primary',
  className = '',
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const next =
        docHeight > 0
          ? Math.min(100, Math.round((scrollTop / docHeight) * 100))
          : 0;
      setProgress(next);
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      aria-label="Scroll progress"
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`fixed top-0 left-0 z-50 h-0.5 transition-[width] duration-150 ${color} ${className}`}
      style={{ width: `${progress}%` } as CSSProperties}
    />
  );
};

ScrollProgress.displayName = 'ScrollProgress';
