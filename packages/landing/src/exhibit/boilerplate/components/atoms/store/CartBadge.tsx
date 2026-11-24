import type { FC } from 'react';

interface CartBadgeProps {
  count: number;
  label?: string;
}

export const CartBadge: FC<CartBadgeProps> = ({ count, label = 'Cart' }) => (
  <button
    type="button"
    className="btn btn-circle btn-ghost btn-sm relative"
    aria-label={label}
    data-testid="cart-badge">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
    <span className="badge badge-secondary badge-sm absolute -top-1 -right-1">
      {count}
    </span>
  </button>
);
