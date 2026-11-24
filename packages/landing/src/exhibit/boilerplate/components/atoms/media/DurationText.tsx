import type { FC } from 'react';

interface DurationTextProps {
  seconds: number;
  className?: string;
}

const formatDuration = (seconds: number): string => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${minutes}:${ss}`;
};

export const DurationText: FC<DurationTextProps> = ({
  seconds,
  className = '',
}) => (
  <span
    data-testid="duration-text"
    className={`text-base-content/70 text-sm tabular-nums ${className}`}>
    {formatDuration(seconds)}
  </span>
);
