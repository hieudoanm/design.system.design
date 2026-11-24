import type { FC } from 'react';

type ConnectionStatus = 'online' | 'offline' | 'away' | 'busy';

interface ConnectionDotProps {
  status: ConnectionStatus;
  size?: 'sm' | 'md' | 'lg';
}

const statusClass: Record<ConnectionStatus, string> = {
  online: 'bg-success',
  offline: 'bg-base-content/30',
  away: 'bg-warning',
  busy: 'bg-error',
};

const sizeClass = { sm: 'h-2 w-2', md: 'h-3 w-3', lg: 'h-4 w-4' } as const;

export const ConnectionDot: FC<ConnectionDotProps> = ({
  status,
  size = 'md',
}) => (
  <span
    aria-label={status}
    className={`${statusClass[status]} ${sizeClass[size]} inline-block rounded-full`}
    data-testid="connection-dot"
  />
);
