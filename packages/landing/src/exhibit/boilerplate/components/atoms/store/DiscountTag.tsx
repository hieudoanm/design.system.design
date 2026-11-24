import type { FC } from 'react';

interface DiscountTagProps {
  discount: number;
  variant?: 'error' | 'success' | 'warning' | 'accent';
}

export const DiscountTag: FC<DiscountTagProps> = ({
  discount,
  variant = 'error',
}) => (
  <span className={`badge badge-${variant} gap-1`} data-testid="discount-tag">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
    -{Math.abs(discount)}%
  </span>
);
