import type { FC } from 'react';

interface ArrivalIconProps {
  size?: number;
  label?: string;
}

export const ArrivalIcon: FC<ArrivalIconProps> = ({
  size = 20,
  label = 'Arrival',
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
    <path d="M2 22h20" />
    <path d="M3.77 17.21 12 19.5l8.23-2.29a1.5 1.5 0 0 0 .39-2.91L10.5 9.5 8.8 6.06a.83.83 0 0 0-1.11-.42l-.83.41a.82.82 0 0 0-.39 1.1L8 10.25 4.5 9.25a.82.82 0 0 0-.95.58l-.39 1.57a.83.83 0 0 0 .55.98z" />
  </svg>
);
