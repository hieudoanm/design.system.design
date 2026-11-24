'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlus, FiTrendingUp } from 'react-icons/fi';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
}

const BUDGETS: Budget[] = [
  { id: 'b1', name: 'Marketing', amount: 8000, spent: 6400 },
  { id: 'b2', name: 'Engineering tools', amount: 5000, spent: 5200 },
  { id: 'b3', name: 'Travel', amount: 4000, spent: 1800 },
  { id: 'b4', name: 'Office', amount: 3000, spent: 2900 },
  { id: 'b5', name: 'Software licenses', amount: 6000, spent: 4500 },
];

export const BudgetsTemplate: FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(BUDGETS);

  const totalAmount = budgets.reduce((sum, budget) => sum + budget.amount, 0);

  const increase = (id: string) => {
    setBudgets((prev) =>
      prev.map((budget) =>
        budget.id === id ? { ...budget, spent: budget.spent + 100 } : budget
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Budgets</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Compare spend against monthly budgets.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Total budget</p>
              <p className="text-2xl font-bold tracking-tight">
                ${totalAmount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {budgets.map((budget) => {
            const over = budget.spent > budget.amount;
            return (
              <div
                key={budget.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold">{budget.name}</h3>
                    {over ? (
                      <span className="badge badge-error badge-sm">
                        Over budget
                      </span>
                    ) : (
                      <span className="badge badge-success badge-sm">
                        On track
                      </span>
                    )}
                  </div>
                  <p className="text-base-content/50 mb-2 text-xs">
                    {`$${budget.spent.toLocaleString()} of $${budget.amount.toLocaleString()}`}
                  </p>
                  <progress
                    className={`progress ${
                      over ? 'progress-error' : 'progress-success'
                    } mb-4 w-full`}
                    value={budget.spent}
                    max={budget.amount}
                    aria-label={`Progress for ${budget.name}`}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => increase(budget.id)}
                      aria-label={`Increase ${budget.name}`}
                      className="btn btn-outline btn-sm gap-1">
                      <FiPlus />+ $100
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

BudgetsTemplate.displayName = 'BudgetsTemplate';
