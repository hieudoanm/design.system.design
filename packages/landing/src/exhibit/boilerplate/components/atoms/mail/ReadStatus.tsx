import type { FC } from 'react';

interface ReadStatusProps {
  read: boolean;
  className?: string;
}

export const ReadStatus: FC<ReadStatusProps> = ({ read, className = '' }) => (
  <span
    data-testid="read-status"
    className={`inline-flex items-center gap-1.5 text-sm ${
      read ? 'text-base-content/60' : 'text-base-content'
    } ${className}`}>
    <span
      aria-hidden="true"
      className={`inline-block h-2 w-2 rounded-full ${read ? 'bg-base-300' : 'bg-primary'}`}
    />
    {read ? 'Read' : 'Unread'}
  </span>
);
