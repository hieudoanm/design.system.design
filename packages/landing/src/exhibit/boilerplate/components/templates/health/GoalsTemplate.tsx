'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiTarget } from 'react-icons/fi';

interface Goal {
  id: string;
  name: string;
  detail: string;
  current: number;
  target: number;
}

const GOALS: Goal[] = [
  {
    id: 'g1',
    name: 'Steps',
    detail: '10,000/day',
    current: 8940,
    target: 10000,
  },
  { id: 'g2', name: 'Sleep', detail: '8h', current: 7.5, target: 8 },
  { id: 'g3', name: 'Water', detail: '8 glasses', current: 5, target: 8 },
  {
    id: 'g4',
    name: 'Active minutes',
    detail: '30 min',
    current: 45,
    target: 30,
  },
];

export const GoalsTemplate: FC = () => {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const markComplete = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Daily health targets.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FiTarget className="text-primary" /> Daily Goals
          </h2>
          <p className="text-base-content/50 text-sm">4 goals</p>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {GOALS.map((goal) => (
            <div
              key={goal.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-sm font-semibold">{goal.name}</h2>
                    <p className="text-base-content/50 text-xs">
                      {goal.detail}
                    </p>
                  </div>
                  {completed[goal.id] ? (
                    <span className="badge badge-success gap-1">
                      <FiCheckCircle />
                      Completed
                    </span>
                  ) : (
                    <button
                      onClick={() => markComplete(goal.id)}
                      className="btn btn-ghost btn-xs">
                      Mark complete
                    </button>
                  )}
                </div>
                <progress
                  className="progress progress-primary"
                  value={Math.min(goal.current, goal.target)}
                  max={goal.target}
                />
                <p className="text-base-content/50 text-xs">
                  {goal.current} of {goal.target}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

GoalsTemplate.displayName = 'GoalsTemplate';
