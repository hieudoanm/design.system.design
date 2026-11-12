import { FC } from 'react';
import type { Card } from '@/exhibit/types/wallet';
import { formatCurrency } from '@/exhibit/lib/wallet/format';

interface CardSpendingProps {
  card: Card;
}

const CardSpending: FC<CardSpendingProps> = ({ card }) => {
  const spent = card.spentThisMonth ?? 0;
  const limit = card.spendingLimit ?? 0;
  const currency = card.currency ?? 'USD';
  const remaining = limit - spent;
  const pct = limit ? Math.round((spent / limit) * 100) : 0;
  const isHigh = pct >= 80;

  return (
    <div className="card bg-base-200 shadow-md">
      <div className="card-body gap-4">
        <h3 className="card-title text-sm">Spending Limit</h3>

        <div className="flex items-baseline justify-between">
          <p className="text-2xl font-bold">
            {formatCurrency(spent, currency)}
          </p>
          <p className="text-base-content/60 text-sm">
            of {formatCurrency(limit, currency)}
          </p>
        </div>

        <div className="bg-base-300 h-3 w-full overflow-hidden rounded-full">
          <div
            className={`h-full rounded-full transition-all ${
              isHigh ? 'bg-error' : 'bg-primary'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <div className="flex justify-between text-xs">
          <span>{pct}% used</span>
          <span>{formatCurrency(remaining, currency)} remaining</span>
        </div>

        {isHigh && (
          <div className="alert alert-warning py-2 text-sm">
            <span>You have used {pct}% of your spending limit.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSpending;
