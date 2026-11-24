import type { FC } from 'react';

interface CompareIconProps {
  size?: number;
  label?: string;
}

export const CompareIcon: FC<CompareIconProps> = ({
  size = 20,
  label = 'Compare',
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
    <line x1="8" y1="3" x2="8" y2="21" />
    <line x1="16" y1="3" x2="16" y2="21" />
    <line x1="3" y1="8" x2="5" y2="8" />
    <line x1="3" y1="16" x2="5" y2="16" />
    <line x1="19" y1="8" x2="21" y2="8" />
    <line x1="19" y1="16" x2="21" y2="16" />
  </svg>
);
