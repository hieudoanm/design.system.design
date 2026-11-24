import type { FC } from 'react';

interface ExpenseCategory {
  name: string;
  amount: number;
  percentage: number;
}

interface ExpenseCategoriesProps {
  categories: ExpenseCategory[];
  currency?: string;
  title?: string;
}

const barColors = [
  'bg-primary',
  'bg-secondary',
  'bg-accent',
  'bg-info',
  'bg-warning',
  'bg-error',
];

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);

export const ExpenseCategories: FC<ExpenseCategoriesProps> = ({
  categories,
  currency = 'USD',
  title = 'Expense categories',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <h3 className="card-title">{title}</h3>
      {categories.map((category, index) => (
        <div key={category.name} className="flex items-center gap-3">
          <span className="w-32 shrink-0 text-sm font-medium">
            {category.name}
          </span>
          <div className="bg-base-100 h-3 flex-1 overflow-hidden rounded-full">
            <div
              className={`${barColors[index % barColors.length]} h-full rounded-full`}
              style={{ width: `${Math.min(category.percentage, 100)}%` }}
              data-testid={`bar-${category.name}`}
            />
          </div>
          <span className="text-base-content/60 w-24 shrink-0 text-right text-xs">
            {category.percentage}% · {formatAmount(category.amount, currency)}
          </span>
        </div>
      ))}
      {categories.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No expense data.
        </p>
      )}
    </div>
  </section>
);
