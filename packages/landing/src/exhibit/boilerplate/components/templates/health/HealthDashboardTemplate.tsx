'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiActivity,
  FiCalendar,
  FiCheckCircle,
  FiHeart,
  FiTrendingUp,
  FiZap,
} from 'react-icons/fi';

interface WeeklyRow {
  day: string;
  steps: number;
  minutes: number;
}

const WEEKLY: WeeklyRow[] = [
  { day: 'Monday', steps: 9840, minutes: 42 },
  { day: 'Tuesday', steps: 11240, minutes: 55 },
  { day: 'Wednesday', steps: 7610, minutes: 28 },
  { day: 'Thursday', steps: 12890, minutes: 61 },
  { day: 'Friday', steps: 10320, minutes: 48 },
  { day: 'Saturday', steps: 14560, minutes: 72 },
  { day: 'Sunday', steps: 6380, minutes: 22 },
];

export const HealthDashboardTemplate: FC = () => {
  const [checkedIn, setCheckedIn] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Health Dashboard</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Today's health at a glance.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">Steps</p>
                <FiActivity className="text-primary" />
              </div>
              <p className="text-2xl font-bold">8,940</p>
              <p className="text-base-content/50 text-xs">+12% vs yesterday</p>
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
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base-content/50 text-xs">Resting HR</p>
                <FiHeart className="text-error" />
              </div>
              <p className="text-2xl font-bold">58 bpm</p>
              <p className="text-base-content/50 text-xs">
                Within normal range
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <FiCalendar className="text-primary" /> Weekly Activity
          </h2>
          <p className="text-base-content/50 text-sm">7 days tracked</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Steps</th>
                  <th>Active Minutes</th>
                </tr>
              </thead>
              <tbody>
                {WEEKLY.map((row) => (
                  <tr key={row.day}>
                    <td>{row.day}</td>
                    <td>{row.steps.toLocaleString()}</td>
                    <td>{row.minutes} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-8 border">
          <div className="card-body gap-3 p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FiTrendingUp className="text-success" />
                <h2 className="text-sm font-semibold">Today's Health</h2>
              </div>
              {checkedIn ? (
                <span className="badge badge-success gap-1">
                  <FiCheckCircle />
                  Checked in
                </span>
              ) : (
                <button
                  onClick={() => setCheckedIn(true)}
                  className="btn btn-primary btn-xs">
                  Check in
                </button>
              )}
            </div>
            <p className="text-base-content/50 text-sm">
              You're feeling energized. Steps and active minutes are trending
              above your weekly average.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

HealthDashboardTemplate.displayName = 'HealthDashboardTemplate';
