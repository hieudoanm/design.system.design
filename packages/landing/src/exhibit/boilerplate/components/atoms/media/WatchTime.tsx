import type { FC } from 'react';

interface WatchTimeProps {
  minutes: number;
  className?: string;
}

const formatWatchTime = (minutes: number): string => {
  const total = Math.max(0, Math.floor(minutes));
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const WatchTime: FC<WatchTimeProps> = ({ minutes, className = '' }) => (
  <span
    data-testid="watch-time"
    className={`text-base-content/70 text-sm tabular-nums ${className}`}>
    {formatWatchTime(minutes)}
  </span>
);
