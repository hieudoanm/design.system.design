import { FC } from 'react';
import { formatCurrency } from '@/exhibit/lib/wallet/format';

interface BudgetSummaryProps {
  totalSpent: number;
  totalLimit: number;
}

const BudgetSummary: FC<BudgetSummaryProps> = ({ totalSpent, totalLimit }) => {
  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm opacity-60">Total Spent</p>
            <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-60">Budget</p>
            <p className="text-2xl font-bold">{formatCurrency(totalLimit)}</p>
          </div>
        </div>

        <progress
          className="progress progress-primary w-full"
          value={totalSpent}
          max={totalLimit}
        />

        <p className="text-base-content/60 text-right text-sm">
          {formatCurrency(totalLimit - totalSpent)} remaining
        </p>
      </div>
    </div>
  );
};

export default BudgetSummary;
