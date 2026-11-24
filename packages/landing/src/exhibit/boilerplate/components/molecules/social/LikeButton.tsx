'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface LikeButtonProps {
  count?: number;
  label?: string;
  active?: boolean;
  onToggle?: (active: boolean) => void;
}

export const LikeButton: FC<LikeButtonProps> = ({
  count = 0,
  label = 'Likes',
  active = false,
  onToggle,
}) => {
  const [liked, setLiked] = useState(active);
  const displayCount = count + (liked ? 1 : 0);

  const handleToggle = () => {
    const next = !liked;
    setLiked(next);
    onToggle?.(next);
  };

  return (
    <div
      className="border-base-300 bg-base-200 flex items-center justify-between rounded-xl border p-3"
      data-testid="like-button-row">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-pressed={liked}
          aria-label={label}
          onClick={handleToggle}
          className={`btn btn-circle btn-sm ${liked ? 'btn-primary' : 'btn-ghost'}`}>
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill={liked ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
        <span className="text-sm font-medium">{label}</span>
      </div>
      <span className="badge badge-ghost font-mono">{displayCount}</span>
    </div>
  );
};
