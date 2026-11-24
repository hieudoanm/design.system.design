import type { FC } from 'react';

interface CategoryIconProps {
  label: string;
  size?: number;
}

export const CategoryIcon: FC<CategoryIconProps> = ({ label, size = 20 }) => (
  <span className="text-base-content/60 inline-flex items-center gap-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
    <span>{label}</span>
  </span>
);
