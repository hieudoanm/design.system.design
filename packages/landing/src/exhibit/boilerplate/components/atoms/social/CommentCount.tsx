import type { FC } from 'react';

interface CommentCountProps {
  count: number;
  label?: string;
}

export const CommentCount: FC<CommentCountProps> = ({
  count,
  label = 'comments',
}) => (
  <span className="flex items-center gap-1 text-sm" data-testid="comment-count">
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
    <span>{count}</span>
    <span className="text-base-content/50">{label}</span>
  </span>
);
