import type { FC } from 'react';

type Status = 'online' | 'away' | 'busy' | 'offline';

interface StatusDotProps {
  status: Status;
  label?: string;
}

const statusClass: Record<Status, string> = {
  online: 'bg-success',
  away: 'bg-warning',
  busy: 'bg-error',
  offline: 'bg-base-content/30',
};

export const StatusDot: FC<StatusDotProps> = ({ status, label }) => (
  <span className="inline-flex items-center gap-2">
    <span
      aria-label={`${status} dot`}
      className={`inline-block h-2.5 w-2.5 rounded-full ${statusClass[status]}`}
    />
    {label && <span className="text-sm">{label}</span>}
  </span>
);
