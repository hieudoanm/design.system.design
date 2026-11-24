import type { FC } from 'react';

interface BudgetItem {
  category: string;
  spent: number;
  limit: number;
}

interface BudgetOverviewProps {
  budgets: BudgetItem[];
  currency?: string;
  title?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

const progressClass = (percentage: number): string => {
  if (percentage >= 100) return 'progress-error';
  if (percentage >= 80) return 'progress-warning';
  return 'progress-success';
};

export const BudgetOverview: FC<BudgetOverviewProps> = ({
  budgets,
  currency = 'USD',
  title = 'Budget overview',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      {budgets.map((budget) => {
        const percentage =
          budget.limit > 0
            ? Math.round((budget.spent / budget.limit) * 100)
            : 0;
        return (
          <div key={budget.category} className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{budget.category}</span>
              <span className="text-base-content/60 text-xs">
                {formatAmount(budget.spent, currency)} /{' '}
                {formatAmount(budget.limit, currency)}
              </span>
            </div>
            <progress
              className={`progress ${progressClass(percentage)} w-full`}
              value={Math.min(budget.spent, budget.limit)}
              max={budget.limit}
            />
          </div>
        );
      })}
      {budgets.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No budgets defined.
        </p>
      )}
    </div>
  </section>
);
