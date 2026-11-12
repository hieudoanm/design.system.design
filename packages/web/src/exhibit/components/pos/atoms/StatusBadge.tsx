import { type FC } from 'react';
import type { TransactionStatus } from '@/exhibit/types/pos';

interface StatusBadgeProps {
  status: TransactionStatus;
  size?: 'xs' | 'sm';
}

export const StatusBadge: FC<StatusBadgeProps> = ({ status, size = 'xs' }) => (
  <span
    className={`badge badge-${size} ${
      status === 'voided' ? 'badge-error' : 'badge-success'
    }`}>
    {status}
  </span>
);
