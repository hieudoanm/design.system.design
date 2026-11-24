import type { FC } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  currency?: string;
  title?: string;
}

const formatAmount = (value: number, currency: string): string =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
    Math.abs(value)
  );

const amountClass = (amount: number): string =>
  amount >= 0 ? 'text-success' : 'text-error';

export const TransactionHistory: FC<TransactionHistoryProps> = ({
  transactions,
  currency = 'USD',
  title = 'Recent transactions',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body">
      <h3 className="card-title">{title}</h3>
      {transactions.length === 0 ? (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No transactions yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table data-testid="transactions-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th className="text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="text-base-content/60 whitespace-nowrap">
                    {tx.date}
                  </td>
                  <td className="font-medium">{tx.description}</td>
                  <td>
                    <span className="badge badge-ghost badge-sm">
                      {tx.category}
                    </span>
                  </td>
                  <td className={`text-right ${amountClass(tx.amount)}`}>
                    {tx.amount >= 0 ? '+' : '-'}
                    {formatAmount(tx.amount, currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
);
