'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiActivity, FiRefreshCw, FiTrendingUp, FiZap } from 'react-icons/fi';

interface TimelineEntry {
  time: string;
  steps: number;
}

const TIMELINE: TimelineEntry[] = [
  { time: '6 AM', steps: 820 },
  { time: '9 AM', steps: 1640 },
  { time: '12 PM', steps: 2380 },
  { time: '3 PM', steps: 1200 },
  { time: '6 PM', steps: 1850 },
  { time: '9 PM', steps: 640 },
  { time: 'Now', steps: 410 },
];

export const ActivityTrackerTemplate: FC = () => {
  const [synced, setSynced] = useState(false);

  const totalSteps = TIMELINE.reduce((sum, entry) => sum + entry.steps, 0);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Activity Tracker</h1>
        <p className="text-base-content/50 mt-1 text-sm">Daily movement.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">Steps</p>
                <FiActivity className="text-primary" />
              </div>
              <p className="text-2xl font-bold">
                {totalSteps.toLocaleString()}
              </p>
              <p className="text-base-content/50 text-xs">Target 10,000</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">Distance</p>
                <FiTrendingUp className="text-success" />
              </div>
              <p className="text-2xl font-bold">6.2 km</p>
              <p className="text-base-content/50 text-xs">Based on stride</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">Active Minutes</p>
                <FiZap className="text-warning" />
              </div>
              <p className="text-2xl font-bold">45</p>
              <p className="text-base-content/50 text-xs">Goal 30 min</p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Daily Steps</h2>
          <div className="flex items-center gap-3">
            <p className="text-base-content/50 text-sm">7 entries today</p>
            {synced ? (
              <span className="badge badge-success">Synced just now</span>
            ) : (
              <button
                onClick={() => setSynced(true)}
                className="btn btn-ghost btn-xs gap-1">
                <FiRefreshCw />
                Sync
              </button>
            )}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Steps</th>
                </tr>
              </thead>
              <tbody>
                {TIMELINE.map((entry) => (
                  <tr key={entry.time}>
                    <td>{entry.time}</td>
                    <td>{entry.steps.toLocaleString()}</td>
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

ActivityTrackerTemplate.displayName = 'ActivityTrackerTemplate';
