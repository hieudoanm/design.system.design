import type { FC } from 'react';

interface StreamBadgeProps {
  count: number;
  label?: string;
  className?: string;
}

const formatCompact = (count: number): string => {
  const value = Math.max(0, count);
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return String(value);
};

export const StreamBadge: FC<StreamBadgeProps> = ({
  count,
  label = 'streams',
  className = '',
}) => (
  <span
    data-testid="stream-badge"
    className={`badge badge-neutral badge-sm gap-1 ${className}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className="h-3 w-3">
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86a1 1 0 0 0-1.5.86Z" />
    </svg>
    {formatCompact(count)} {label}
  </span>
);
