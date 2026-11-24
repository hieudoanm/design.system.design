'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';

type TransactionType = 'Income' | 'Expense';
type TransactionFilter = 'All' | TransactionType;

interface Transaction {
  id: string;
  description: string;
  date: string;
  amount: number;
  type: TransactionType;
}

const TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    description: 'Client payment',
    date: 'Aug 05',
    amount: 4800,
    type: 'Income',
  },
  {
    id: 't2',
    description: 'Cloud hosting',
    date: 'Aug 03',
    amount: -320,
    type: 'Expense',
  },
  {
    id: 't3',
    description: 'Software license',
    date: 'Aug 01',
    amount: -89,
    type: 'Expense',
  },
  {
    id: 't4',
    description: 'Consulting invoice',
    date: 'Jul 30',
    amount: 2100,
    type: 'Income',
  },
  {
    id: 't5',
    description: 'Office rent',
    date: 'Jul 28',
    amount: -1500,
    type: 'Expense',
  },
  {
    id: 't6',
    description: 'Refund from vendor',
    date: 'Jul 25',
    amount: 450,
    type: 'Income',
  },
  {
    id: 't7',
    description: 'Equipment purchase',
    date: 'Jul 22',
    amount: -2400,
    type: 'Expense',
  },
];

const FILTERS: TransactionFilter[] = ['All', 'Income', 'Expense'];

const getTypeBadge = (type: TransactionType) => {
  if (type === 'Income') {
    return <span className="badge badge-success badge-sm">Income</span>;
  }
  return <span className="badge badge-error badge-sm">Expense</span>;
};

export const TransactionsTemplate: FC = () => {
  const [filter, setFilter] = useState<TransactionFilter>('All');

  const visible = TRANSACTIONS.filter(
    (transaction) => filter === 'All' || transaction.type === filter
  );

  const net = visible.reduce((sum, transaction) => sum + transaction.amount, 0);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Review the account ledger.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Net balance</p>
              <p className="text-2xl font-bold tracking-tight">
                ${net.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 text-right font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((transaction) => (
                    <tr
                      key={transaction.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {transaction.description}
                      </td>
                      <td className="px-4 py-3 text-sm">{transaction.date}</td>
                      <td
                        className={`px-4 py-3 text-right text-sm ${
                          transaction.type === 'Income'
                            ? 'text-success'
                            : 'text-error'
                        }`}>
                        ${transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {getTypeBadge(transaction.type)}
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
