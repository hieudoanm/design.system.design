import type { FC } from 'react';

type PaymentStatusValue = 'paid' | 'pending' | 'overdue' | 'failed';

interface PaymentStatusProps {
  status: PaymentStatusValue;
  className?: string;
}

const statusClass: Record<PaymentStatusValue, string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
  failed: 'badge-error badge-outline',
};

const statusLabel: Record<PaymentStatusValue, string> = {
  paid: 'Paid',
  pending: 'Pending',
  overdue: 'Overdue',
  failed: 'Failed',
};

export const PaymentStatus: FC<PaymentStatusProps> = ({
  status,
  className = '',
}) => (
  <span
    data-testid="payment-status"
    className={`badge ${statusClass[status]} ${className}`}>
    {statusLabel[status]}
  </span>
);
