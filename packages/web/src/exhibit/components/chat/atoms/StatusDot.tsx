import { type FC } from 'react';

interface StatusDotProps {
  online: boolean;
  className?: string;
}

export const StatusDot: FC<StatusDotProps> = ({ online, className = '' }) => (
  <span
    className={`inline-block h-2 w-2 rounded-full ${online ? 'bg-success' : 'bg-neutral'} ${className}`}
    aria-label={online ? 'online' : 'offline'}
    data-testid="status-dot"
  />
);
