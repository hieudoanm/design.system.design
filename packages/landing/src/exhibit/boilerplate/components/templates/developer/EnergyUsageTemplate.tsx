'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBarChart, FiZap } from 'react-icons/fi';

type Period = 'Today' | 'This week' | 'This month';

interface PeriodData {
  usage: string;
  cost: string;
}

const PERIODS: Record<Period, PeriodData> = {
  Today: { usage: '12.4 kWh', cost: '$2.10' },
  'This week': { usage: '42.8 kWh', cost: '$7.10' },
  'This month': { usage: '184.6 kWh', cost: '$30.20' },
};

const PERIOD_KEYS: Period[] = ['Today', 'This week', 'This month'];

const ROOMS = [
  { name: 'Living Room', usage: '4.2 kWh', percent: 55 },
  { name: 'Kitchen', usage: '3.1 kWh', percent: 40 },
  { name: 'Bedroom', usage: '2.8 kWh', percent: 35 },
];

const DAYS = [
  { day: 'Monday', usage: '8.1 kWh', cost: '$1.40' },
  { day: 'Tuesday', usage: '7.4 kWh', cost: '$1.28' },
  { day: 'Wednesday', usage: '9.2 kWh', cost: '$1.60' },
  { day: 'Thursday', usage: '6.8 kWh', cost: '$1.18' },
  { day: 'Friday', usage: '7.9 kWh', cost: '$1.37' },
  { day: 'Saturday', usage: '3.2 kWh', cost: '$0.55' },
  { day: 'Sunday', usage: '3.4 kWh', cost: '$0.73' },
];

export const EnergyUsageTemplate: FC = () => {
  const [period, setPeriod] = useState<Period>('Today');

  const data = PERIODS[period];

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Energy Usage</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track consumption across your home.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="tabs tabs-boxed tabs-sm mb-4 w-fit">
          {PERIOD_KEYS.map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`tab ${period === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="text-base-content/50 flex items-center gap-2">
                <FiZap />
                <p className="stat-title">Usage</p>
              </div>
              <p className="stat-value text-3xl">{data.usage}</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <div className="text-base-content/50 flex items-center gap-2">
                <FiBarChart />
                <p className="stat-title">Estimated cost</p>
              </div>
              <p className="stat-value text-3xl">{data.cost}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <h2 className="text-xl font-semibold">By room</h2>
          <span className="badge badge-ghost badge-sm">3 rooms</span>
        </div>
        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body space-y-4 p-5">
            {ROOMS.map((room) => (
              <div key={room.name}>
                <div className="flex items-center justify-between text-sm">
                  <span>{room.name}</span>
                  <span className="text-base-content/50">{room.usage}</span>
                </div>
                <progress
                  className="progress progress-primary mt-2 h-2"
                  value={room.percent}
                  max={100}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <h2 className="text-xl font-semibold">Last 7 days</h2>
          <span className="badge badge-ghost badge-sm">7 days</span>
        </div>
        <div className="card bg-base-200 border-base-content/10 mt-3 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr className="text-base-content/40 text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Day</th>
                    <th className="px-4 py-3 font-medium">Usage</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((item) => (
                    <tr
                      key={item.day}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm">{item.day}</td>
                      <td className="px-4 py-3 text-sm">{item.usage}</td>
                      <td className="px-4 py-3 text-sm">{item.cost}</td>
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

EnergyUsageTemplate.displayName = 'EnergyUsageTemplate';
