import type { FC } from 'react';

interface FlightBadgeProps {
  code: string;
  status?: 'on-time' | 'delayed' | 'boarding' | 'cancelled';
}

const variantMap = {
  'on-time': 'badge-success',
  delayed: 'badge-warning',
  boarding: 'badge-info',
  cancelled: 'badge-error',
} as const;

export const FlightBadge: FC<FlightBadgeProps> = ({
  code,
  status = 'on-time',
}) => (
  <span
    className={`badge ${variantMap[status]} gap-1 font-mono`}
    data-testid="flight-badge">
    ✈ {code}
    {status !== 'on-time' && ` · ${status}`}
  </span>
);
