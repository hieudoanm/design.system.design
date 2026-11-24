'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiArrowDownLeft,
  FiArrowUpRight,
  FiCheck,
  FiPlus,
} from 'react-icons/fi';

type TransactionAction = 'Buy' | 'Sell';

interface Transaction {
  id: string;
  date: string;
  action: TransactionAction;
  ticker: string;
  shares: string;
  amount: string;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    date: 'Aug 7, 2026',
    action: 'Buy',
    ticker: 'AAPL',
    shares: '12',
    amount: '$2,788.80',
  },
  {
    id: 't2',
    date: 'Aug 5, 2026',
    action: 'Sell',
    ticker: 'SCHD',
    shares: '20',
    amount: '$1,684.00',
  },
  {
    id: 't3',
    date: 'Aug 1, 2026',
    action: 'Buy',
    ticker: 'BTC',
    shares: '0.25',
    amount: '$16,850.00',
  },
  {
    id: 't4',
    date: 'Jul 28, 2026',
    action: 'Sell',
    ticker: 'TSLA',
    shares: '5',
    amount: '$1,612.50',
  },
  {
    id: 't5',
    date: 'Jul 25, 2026',
    action: 'Buy',
    ticker: 'VOO',
    shares: '10',
    amount: '$5,321.00',
  },
];

const getActionBadge = (action: TransactionAction) => {
  if (action === 'Buy') {
    return (
      <span className="badge badge-success badge-sm gap-1">
        <FiArrowUpRight />
        Buy
      </span>
    );
  }
  return (
    <span className="badge badge-error badge-sm gap-1">
      <FiArrowDownLeft />
      Sell
    </span>
  );
};

export const TransactionsTemplate: FC = () => {
  const [added, setAdded] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          History of buys and sells.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base-content/50 text-sm">
            {TRANSACTIONS.length} transactions
          </p>
          <button
            onClick={() => setAdded((prev) => !prev)}
            className="btn btn-primary btn-sm gap-1">
            {added ? <FiCheck /> : <FiPlus />}
            {added ? 'Transaction added' : 'New transaction'}
          </button>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Ticker</th>
                    <th className="px-4 py-3 text-right font-medium">Shares</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {TRANSACTIONS.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm">{transaction.date}</td>
                      <td className="px-4 py-3">
                        {getActionBadge(transaction.action)}
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">
                        {transaction.ticker}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        {transaction.shares}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm">
                        {transaction.amount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TransactionsTemplate.displayName = 'TransactionsTemplate';
