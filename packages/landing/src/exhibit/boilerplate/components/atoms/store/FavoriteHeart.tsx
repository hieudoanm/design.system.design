'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface FavoriteHeartProps {
  active?: boolean;
  size?: number;
  label?: string;
  onChange?: (active: boolean) => void;
}

export const FavoriteHeart: FC<FavoriteHeartProps> = ({
  active = false,
  size = 24,
  label = 'Toggle favorite',
  onChange,
}) => {
  const [toggled, setToggled] = useState(active);

  const toggle = () => {
    const next = !toggled;
    setToggled(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      className={`btn btn-circle btn-ghost btn-sm ${toggled ? 'text-error' : ''}`}
      aria-label={label}
      aria-pressed={toggled}
      onClick={toggle}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={toggled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};
