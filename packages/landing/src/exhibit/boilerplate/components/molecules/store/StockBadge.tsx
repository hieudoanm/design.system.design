import type { FC } from 'react';

interface StockBadgeProps {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
  quantity?: number;
}

const variantMap = {
  'in-stock': 'badge-success',
  'low-stock': 'badge-warning',
  'out-of-stock': 'badge-error',
} as const;

const labelMap = {
  'in-stock': 'In stock',
  'low-stock': 'Low stock',
  'out-of-stock': 'Out of stock',
} as const;

export const StockBadge: FC<StockBadgeProps> = ({ status, quantity }) => (
  <span className={`badge ${variantMap[status]}`} data-testid="stock-badge">
    {labelMap[status]}
    {quantity !== undefined &&
      status !== 'out-of-stock' &&
      ` · ${quantity} left`}
  </span>
);
