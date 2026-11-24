import type { FC } from 'react';

interface TravelIconProps {
  size?: number;
  label?: string;
}

export const TravelIcon: FC<TravelIconProps> = ({
  size = 20,
  label = 'Travel',
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    role="img"
    aria-label={label}>
    <path d="M3 7h18v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="12" y1="13" x2="12" y2="17" />
  </svg>
);
