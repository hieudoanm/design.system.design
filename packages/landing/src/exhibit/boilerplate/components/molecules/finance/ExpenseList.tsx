import type { FC } from 'react';

interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category?: string;
  date?: string;
}

interface ExpenseListProps {
  expenses: ExpenseItem[];
  currency?: string;
  limit?: number;
}

export const ExpenseList: FC<ExpenseListProps> = ({
  expenses,
  currency = '$',
  limit,
}) => {
  const items = limit ? expenses.slice(0, limit) : expenses;
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="expense-list">
      <div className="card-body gap-2">
        <h3 className="card-title text-base">Expenses</h3>
        {items.length === 0 ? (
          <p className="text-base-content/50 text-sm">No expenses yet</p>
        ) : (
          <ul className="divide-base-content/10 flex flex-col divide-y">
            {items.map((expense) => (
              <li
                key={expense.id}
                className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {expense.title}
                  </p>
                  <p className="text-base-content/50 text-xs">
                    {expense.category && `${expense.category} · `}
                    {expense.date}
                  </p>
                </div>
                <span className="text-error text-sm font-semibold">
                  −{currency}
                  {expense.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
