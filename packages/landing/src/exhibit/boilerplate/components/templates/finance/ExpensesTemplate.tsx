'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiX } from 'react-icons/fi';

type ExpenseStatus = 'Pending' | 'Approved' | 'Rejected';
type ExpenseFilter = 'All' | ExpenseStatus;

interface Expense {
  id: string;
  title: string;
  amount: string;
  date: string;
  status: ExpenseStatus;
}

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Flight to NYC',
    amount: '$450.00',
    date: 'Aug 02',
    status: 'Pending',
  },
  {
    id: 'e2',
    title: 'Client dinner',
    amount: '$120.50',
    date: 'Aug 01',
    status: 'Approved',
  },
  {
    id: 'e3',
    title: 'Office supplies',
    amount: '$85.00',
    date: 'Jul 28',
    status: 'Rejected',
  },
  {
    id: 'e4',
    title: 'Conference tickets',
    amount: '$650.00',
    date: 'Jul 25',
    status: 'Pending',
  },
];

const FILTERS: ExpenseFilter[] = ['All', 'Pending', 'Approved', 'Rejected'];

const getStatusBadge = (status: ExpenseStatus) => {
  switch (status) {
    case 'Approved':
      return <span className="badge badge-success badge-sm">Approved</span>;
    case 'Rejected':
      return <span className="badge badge-error badge-sm">Rejected</span>;
    default:
      return <span className="badge badge-warning badge-sm">Pending</span>;
  }
};

export const ExpensesTemplate: FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [filter, setFilter] = useState<ExpenseFilter>('All');

  const approved = expenses.filter((e) => e.status === 'Approved').length;
  const visible = expenses.filter(
    (e) => filter === 'All' || e.status === filter
  );

  const setStatus = (id: string, status: ExpenseStatus) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track and approve team expenses.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {approved} of {expenses.length} approved
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Expense</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((expense) => (
                    <tr
                      key={expense.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {expense.title}
                      </td>
                      <td className="px-4 py-3 text-sm">{expense.amount}</td>
                      <td className="px-4 py-3 text-sm">{expense.date}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(expense.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => setStatus(expense.id, 'Approved')}
                            className="btn btn-ghost btn-xs">
                            <FiCheck />
                            Approve
                          </button>
                          <button
                            onClick={() => setStatus(expense.id, 'Rejected')}
                            className="btn btn-ghost btn-xs hover:text-error">
                            <FiX />
                            Reject
                          </button>
                        </div>
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

ExpensesTemplate.displayName = 'ExpensesTemplate';
