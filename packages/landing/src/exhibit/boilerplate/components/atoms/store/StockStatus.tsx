import type { FC } from 'react';

interface StockStatusProps {
  status: 'in' | 'low' | 'out';
  count?: number;
}

const variantMap = {
  in: 'badge-success',
  low: 'badge-warning',
  out: 'badge-error',
} as const;

const labelMap = {
  in: 'In stock',
  low: 'Low stock',
  out: 'Out of stock',
} as const;

export const StockStatus: FC<StockStatusProps> = ({ status, count }) => (
  <span className={`badge ${variantMap[status]}`} data-testid="stock-status">
    {labelMap[status]}
    {count !== undefined && status !== 'out' && ` · ${count}`}
  </span>
);
