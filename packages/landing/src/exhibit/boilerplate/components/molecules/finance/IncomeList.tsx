import type { FC } from 'react';

interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  date?: string;
}

interface IncomeListProps {
  incomes: IncomeItem[];
  currency?: string;
  limit?: number;
}

export const IncomeList: FC<IncomeListProps> = ({
  incomes,
  currency = '$',
  limit,
}) => {
  const items = limit ? incomes.slice(0, limit) : incomes;
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="income-list">
      <div className="card-body gap-2">
        <h3 className="card-title text-base">Income</h3>
        {items.length === 0 ? (
          <p className="text-base-content/50 text-sm">No income recorded</p>
        ) : (
          <ul className="divide-base-content/10 flex flex-col divide-y">
            {items.map((income) => (
              <li
                key={income.id}
                className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {income.source}
                  </p>
                  {income.date && (
                    <p className="text-base-content/50 text-xs">
                      {income.date}
                    </p>
                  )}
                </div>
                <span className="text-success text-sm font-semibold">
                  +{currency}
                  {income.amount.toLocaleString('en-US', {
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
