import type { FC } from 'react';

interface FreeShippingProps {
  label?: string;
}

export const FreeShipping: FC<FreeShippingProps> = ({
  label = 'Free shipping',
}) => (
  <span className="badge badge-success gap-1" data-testid="free-shipping">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3 w-3"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
    {label}
  </span>
);
