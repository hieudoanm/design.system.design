'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTrendingUp } from 'react-icons/fi';

interface Goal {
  id: string;
  title: string;
  progress: number;
}

const INITIAL_GOALS: Goal[] = [
  { id: 'g1', title: 'Grow monthly revenue', progress: 40 },
  { id: 'g2', title: 'Ship the new dashboard', progress: 70 },
  { id: 'g3', title: 'Improve activation rate', progress: 25 },
  { id: 'g4', title: 'Reduce support tickets', progress: 55 },
];

export const GoalsTemplate: FC = () => {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);

  const overall = Math.round(
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
  );

  const advance = (id: string) => {
    setGoals((prev) =>
      prev.map((goal) =>
        goal.id === id
          ? { ...goal, progress: Math.min(100, goal.progress + 10) }
          : goal
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track OKRs and advance progress toward each outcome.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiTrendingUp />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Overall progress</p>
              <p className="text-2xl font-bold tracking-tight">{overall}%</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold">{goal.title}</h3>
                  <span className="text-sm font-bold">{goal.progress}%</span>
                </div>
                <progress
                  className="progress progress-primary mb-4 w-full"
                  value={goal.progress}
                  max={100}
                  aria-label={`Progress for ${goal.title}`}
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => advance(goal.id)}
                    className="btn btn-primary btn-sm">
                    + 10%
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

GoalsTemplate.displayName = 'GoalsTemplate';
