import type { FC } from 'react';

interface PlayCountProps {
  count: number;
  label?: string;
  className?: string;
}

export const PlayCount: FC<PlayCountProps> = ({
  count,
  label = 'plays',
  className = '',
}) => (
  <span
    data-testid="play-count"
    className={`text-base-content/60 inline-flex items-center gap-1.5 text-sm ${className}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-3.5 w-3.5">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z" />
    </svg>
    <span>
      {count.toLocaleString()} {label}
    </span>
  </span>
);
