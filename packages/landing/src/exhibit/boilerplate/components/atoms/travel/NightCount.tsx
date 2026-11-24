import type { FC } from 'react';

interface NightCountProps {
  count: number;
}

export const NightCount: FC<NightCountProps> = ({ count }) => (
  <span
    className="text-base-content/70 inline-flex items-center gap-1 text-sm"
    data-testid="night-count">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
    {count} {count === 1 ? 'night' : 'nights'}
  </span>
);
