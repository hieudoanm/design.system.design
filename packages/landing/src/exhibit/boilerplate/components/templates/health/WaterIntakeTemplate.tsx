'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiDroplet, FiPlus } from 'react-icons/fi';

interface DayRow {
  day: string;
  glasses: number;
}

const GOAL = 8;

const DAYS: DayRow[] = [
  { day: 'Monday', glasses: 7 },
  { day: 'Tuesday', glasses: 8 },
  { day: 'Wednesday', glasses: 5 },
  { day: 'Thursday', glasses: 6 },
  { day: 'Friday', glasses: 8 },
  { day: 'Saturday', glasses: 4 },
  { day: 'Sunday', glasses: 3 },
];

export const WaterIntakeTemplate: FC = () => {
  const [glasses, setGlasses] = useState(5);

  const goalReached = glasses >= GOAL;

  const addGlass = () => {
    setGlasses((prev) => Math.min(prev + 1, GOAL));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Water Intake</h1>
        <p className="text-base-content/50 mt-1 text-sm">Hydration goal.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiDroplet className="text-primary" />
                <h2 className="text-sm font-semibold">Daily Goal</h2>
              </div>
              <span className="badge badge-primary badge-sm">
                8 glasses/day
              </span>
            </div>

            <div>
              <p className="text-2xl font-bold">
                {glasses} of {GOAL} glasses
              </p>
              <p className="text-base-content/50 text-xs">
                {goalReached ? 'You hit your daily target' : 'Keep drinking'}
              </p>
            </div>

            <progress
              className="progress progress-primary"
              value={glasses}
              max={GOAL}
            />

            {goalReached ? (
              <span className="badge badge-success w-fit gap-1">
                <FiDroplet />
                Goal reached
              </span>
            ) : (
              <button
                onClick={addGlass}
                className="btn btn-primary btn-sm w-fit gap-1">
                <FiPlus />
                Add glass
              </button>
            )}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FiCalendar className="text-primary" /> Daily History
          </h2>
          <p className="text-base-content/50 text-sm">7 days recorded</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Glasses</th>
                </tr>
              </thead>
              <tbody>
                {DAYS.map((row) => (
                  <tr key={row.day}>
                    <td>{row.day}</td>
                    <td>{row.glasses} glasses</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

WaterIntakeTemplate.displayName = 'WaterIntakeTemplate';
