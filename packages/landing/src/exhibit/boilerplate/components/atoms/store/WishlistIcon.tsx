'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface WishlistIconProps {
  active?: boolean;
  size?: number;
  label?: string;
  onChange?: (active: boolean) => void;
}

export const WishlistIcon: FC<WishlistIconProps> = ({
  active = false,
  size = 24,
  label = 'Toggle wishlist',
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
      className={`btn btn-circle btn-ghost btn-sm ${toggled ? 'text-primary' : ''}`}
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
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
};
