import type { FC } from 'react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category?: string;
  amount: number;
  type: 'income' | 'expense';
}

interface TransactionTableProps {
  transactions: Transaction[];
  currency?: string;
}

export const TransactionTable: FC<TransactionTableProps> = ({
  transactions,
  currency = '$',
}) => (
  <div
    className="card bg-base-100 w-full shadow"
    data-testid="transaction-table">
    <div className="card-body gap-3">
      <h3 className="card-title text-base">Transactions</h3>
      {transactions.length === 0 ? (
        <p className="text-base-content/50 text-sm">No transactions</p>
      ) : (
        <table className="table-zebra table-compact table">
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
                <td className="text-base-content/60">{tx.date}</td>
                <td className="font-medium">{tx.description}</td>
                <td className="text-base-content/60">{tx.category ?? '—'}</td>
                <td
                  className={`text-right font-semibold ${
                    tx.type === 'income' ? 'text-success' : 'text-error'
                  }`}>
                  {tx.type === 'income' ? '+' : '−'}
                  {currency}
                  {tx.amount.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </div>
);
