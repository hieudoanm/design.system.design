import type { FC } from 'react';

interface BudgetCardProps {
  name: string;
  spent: number;
  limit: number;
  currency?: string;
}

export const BudgetCard: FC<BudgetCardProps> = ({
  name,
  spent,
  limit,
  currency = '$',
}) => {
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const remaining = limit - spent;
  let progressClass = 'progress-success';
  if (pct >= 80) progressClass = 'progress-warning';
  if (pct >= 100) progressClass = 'progress-error';
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="budget-card">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{name}</h3>
          <span className="text-base-content/50 text-sm">{pct}% used</span>
        </div>
        <progress
          className={`progress ${progressClass} h-3 w-full`}
          value={pct}
          max={100}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium" data-testid="budget-spent">
            {currency}
            {spent.toLocaleString()}
          </span>
          <span className="text-base-content/50">
            of {currency}
            {limit.toLocaleString()}
          </span>
        </div>
        <p
          className="text-base-content/60 text-sm"
          data-testid="budget-remaining">
          {remaining >= 0
            ? `${currency}${remaining.toLocaleString()} left`
            : `Over by ${currency}${Math.abs(remaining).toLocaleString()}`}
        </p>
      </div>
    </div>
  );
};
