import type { FC } from 'react';

interface DepartureIconProps {
  size?: number;
  label?: string;
}

export const DepartureIcon: FC<DepartureIconProps> = ({
  size = 20,
  label = 'Departure',
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
    <path d="M22 2 11 13" />
    <path d="M22 2 15 22l-4-9-9-4z" />
  </svg>
);
