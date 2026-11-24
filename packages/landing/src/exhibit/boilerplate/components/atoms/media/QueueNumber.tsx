import type { FC } from 'react';

interface QueueNumberProps {
  number: number;
  className?: string;
}

export const QueueNumber: FC<QueueNumberProps> = ({
  number,
  className = '',
}) => (
  <span
    data-testid="queue-number"
    className={`bg-base-200 text-base-content/70 flex h-6 w-6 items-center justify-center rounded-full text-xs tabular-nums ${className}`}>
    {String(Math.max(0, number)).padStart(2, '0')}
  </span>
);
