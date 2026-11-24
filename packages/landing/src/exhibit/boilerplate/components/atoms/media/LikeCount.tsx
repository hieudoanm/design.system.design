import type { FC } from 'react';

interface LikeCountProps {
  count: number;
  liked?: boolean;
  className?: string;
}

export const LikeCount: FC<LikeCountProps> = ({
  count,
  liked = false,
  className = '',
}) => (
  <span
    data-testid="like-count"
    className={`inline-flex items-center gap-1.5 text-sm ${
      liked ? 'text-error' : 'text-base-content/60'
    } ${className}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={liked ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-3.5 w-3.5">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
    <span>{count.toLocaleString()}</span>
  </span>
);
