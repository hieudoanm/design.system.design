import type { FC } from 'react';

interface ReadingTimeProps {
  minutes: number;
  label?: string;
}

export const ReadingTime: FC<ReadingTimeProps> = ({ minutes, label = '' }) => (
  <span data-testid="reading-time" className="text-base-content/60 text-sm">
    {label && <span className="mr-1">{label}: </span>}
    {minutes} min read
  </span>
);
