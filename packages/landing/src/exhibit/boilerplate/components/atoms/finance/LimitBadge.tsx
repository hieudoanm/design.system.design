import type { FC } from 'react';

interface LimitBadgeProps {
  limit: number;
  used?: number;
  currency?: string;
  className?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const LimitBadge: FC<LimitBadgeProps> = ({
  limit,
  used = 0,
  currency = 'USD',
  className = '',
}) => {
  const over = used > limit;
  return (
    <span
      data-testid="limit-badge"
      className={`badge ${
        over ? 'badge-error' : 'badge-success'
      } ${className}`}>
      {formatAmount(used, currency)} / {formatAmount(limit, currency)}
    </span>
  );
};
