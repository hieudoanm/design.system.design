import type { FC } from 'react';

interface AccountOverviewProps {
  balance: number;
  income: number;
  expenses: number;
  accountName?: string;
  currency?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(value);

export const AccountOverview: FC<AccountOverviewProps> = ({
  balance,
  income,
  expenses,
  accountName = 'Main account',
  currency = 'USD',
}) => {
  const savingsRate =
    income > 0 ? Math.round(((income - expenses) / income) * 100) : 0;

  return (
    <section className="card bg-base-200 w-full">
      <div className="card-body">
        <h3 className="card-title">{accountName}</h3>
        <p className="text-base-content/60 text-sm">Current balance</p>
        <p className="text-3xl font-light" data-testid="balance">
          {formatAmount(balance, currency)}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-base-100 rounded-xl p-4">
            <p className="text-base-content/50 text-xs">Income</p>
            <p className="text-success text-lg" data-testid="income">
              {formatAmount(income, currency)}
            </p>
          </div>
          <div className="bg-base-100 rounded-xl p-4">
            <p className="text-base-content/50 text-xs">Expenses</p>
            <p className="text-error text-lg" data-testid="expenses">
              {formatAmount(expenses, currency)}
            </p>
          </div>
        </div>
        <div className="bg-base-100 mt-2 flex items-center justify-between rounded-xl p-4">
          <span className="text-sm">Savings rate</span>
          <span className="badge badge-success">{savingsRate}%</span>
        </div>
      </div>
    </section>
  );
};
