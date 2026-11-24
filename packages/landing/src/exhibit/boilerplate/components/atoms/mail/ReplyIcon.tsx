import type { FC } from 'react';

interface ReplyIconProps {
  className?: string;
  size?: number;
}

export const ReplyIcon: FC<ReplyIconProps> = ({
  className = '',
  size = 16,
}) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    data-testid="reply-icon"
    className={`inline-block ${className}`}>
    <polyline points="9 17 4 12 9 7" />
    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
  </svg>
);
