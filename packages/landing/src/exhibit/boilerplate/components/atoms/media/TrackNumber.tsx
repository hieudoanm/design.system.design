import type { FC } from 'react';

interface TrackNumberProps {
  number: number;
  className?: string;
}

export const TrackNumber: FC<TrackNumberProps> = ({
  number,
  className = '',
}) => (
  <span
    data-testid="track-number"
    className={`text-base-content/60 text-sm tabular-nums ${className}`}>
    {String(Math.max(0, number)).padStart(2, '0')}
  </span>
);
