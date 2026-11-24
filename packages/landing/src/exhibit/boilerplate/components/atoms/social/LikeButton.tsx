'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface LikeButtonProps {
  liked?: boolean;
  count?: number;
  onToggle?: (liked: boolean) => void;
  ariaLabel?: string;
}

export const LikeButton: FC<LikeButtonProps> = ({
  liked = false,
  count = 0,
  onToggle,
  ariaLabel = 'Like',
}) => {
  const [active, setActive] = useState(liked);

  const handleToggle = () => {
    const next = !active;
    setActive(next);
    onToggle?.(next);
  };

  const displayCount = count + (active ? 1 : 0);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={ariaLabel}
      onClick={handleToggle}
      className={`btn btn-sm gap-1 ${active ? 'btn-primary' : 'btn-ghost'}`}
      data-testid="like-button">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
      <span>{displayCount}</span>
    </button>
  );
};
