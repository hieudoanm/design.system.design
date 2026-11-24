'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiMoon, FiStar } from 'react-icons/fi';

interface SleepStage {
  stage: string;
  hours: number;
}

interface NightRow {
  day: string;
  hours: number;
  quality: 'Good' | 'Fair' | 'Poor';
}

const STAGES: SleepStage[] = [
  { stage: 'Deep', hours: 1.8 },
  { stage: 'REM', hours: 1.5 },
  { stage: 'Light', hours: 4.1 },
];

const NIGHTS: NightRow[] = [
  { day: 'Monday', hours: 7.4, quality: 'Good' },
  { day: 'Tuesday', hours: 6.1, quality: 'Fair' },
  { day: 'Wednesday', hours: 8.2, quality: 'Good' },
  { day: 'Thursday', hours: 5.5, quality: 'Poor' },
  { day: 'Friday', hours: 7.8, quality: 'Good' },
  { day: 'Saturday', hours: 8.5, quality: 'Good' },
  { day: 'Sunday', hours: 7.5, quality: 'Good' },
];

const qualityClass = (quality: NightRow['quality']) => {
  if (quality === 'Good') return 'badge-success';
  if (quality === 'Fair') return 'badge-warning';
  return 'badge-error';
};

export const SleepTrackerTemplate: FC = () => {
  const [tracking, setTracking] = useState(false);

  const lastNight = 7.5;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Sleep Tracker</h1>
        <p className="text-base-content/50 mt-1 text-sm">Recovery and rest.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body gap-3 p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <FiMoon className="text-primary" />
                  <h2 className="text-sm font-semibold">Last Night</h2>
                </div>
                {tracking ? (
                  <span className="badge badge-success">Tracking tonight</span>
                ) : (
                  <button
                    onClick={() => setTracking(true)}
                    className="btn btn-primary btn-xs">
                    Track tonight
                  </button>
                )}
              </div>
              <p className="flex items-center gap-2 text-2xl font-bold">
                <FiClock className="h-5 w-5" />
                {lastNight} h
              </p>
              {STAGES.map((stage) => (
                <div key={stage.stage}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <p className="text-base-content/50">{stage.stage}</p>
                    <p className="text-base-content/50">{stage.hours} h</p>
                  </div>
                  <progress
                    className="progress progress-primary"
                    value={stage.hours}
                    max={lastNight}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body gap-2 p-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Quality Score</h2>
                <FiStar className="text-warning" />
              </div>
              <p className="text-4xl font-bold">82</p>
              <p className="text-base-content/50 text-sm">Excellent quality</p>
              <p className="text-base-content/50 text-sm">
                Average 7.3 h / night
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Last 7 Nights</h2>
          <p className="text-base-content/50 text-sm">7 nights tracked</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-5">
            <table className="table">
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Duration</th>
                  <th>Quality</th>
                </tr>
              </thead>
              <tbody>
                {NIGHTS.map((night) => (
                  <tr key={night.day}>
                    <td>{night.day}</td>
                    <td>{night.hours} h</td>
                    <td>
                      <span
                        className={`badge ${qualityClass(night.quality)} badge-sm`}>
                        {night.quality}
                      </span>
                    </td>
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

SleepTrackerTemplate.displayName = 'SleepTrackerTemplate';
