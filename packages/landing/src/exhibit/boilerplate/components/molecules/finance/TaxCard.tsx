import type { FC } from 'react';

type TaxStatus = 'paid' | 'pending' | 'overdue';

interface TaxCardProps {
  title: string;
  amount: number;
  dueDate: string;
  status?: TaxStatus;
  currency?: string;
}

const statusBadges: Record<TaxStatus, string> = {
  paid: 'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
};

export const TaxCard: FC<TaxCardProps> = ({
  title,
  amount,
  dueDate,
  status = 'pending',
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="tax-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{title}</h3>
        <span className={`badge ${statusBadges[status]}`}>{status}</span>
      </div>
      <p className="text-3xl font-bold" data-testid="tax-amount">
        {currency}
        {amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
      <p className="text-base-content/60 text-sm">Due {dueDate}</p>
    </div>
  </div>
);
