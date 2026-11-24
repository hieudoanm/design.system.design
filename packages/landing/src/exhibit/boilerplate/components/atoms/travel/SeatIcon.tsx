import type { FC } from 'react';

interface SeatIconProps {
  size?: number;
  label?: string;
}

export const SeatIcon: FC<SeatIconProps> = ({ size = 20, label = 'Seat' }) => (
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
    <path d="M7 3h10a2 2 0 0 1 2 2v5" />
    <path d="M5 10a2 2 0 0 0-2 2v3h18v-3a2 2 0 0 0-2-2" />
    <path d="M5 15v4" />
    <path d="M19 15v4" />
  </svg>
);
