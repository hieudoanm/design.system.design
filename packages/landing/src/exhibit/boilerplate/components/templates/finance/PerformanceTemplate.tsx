'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBarChart, FiTrendingDown, FiTrendingUp } from 'react-icons/fi';

interface Range {
  label: string;
  value: string;
}

interface MonthBar {
  month: string;
  percent: number;
}

const RANGES: Range[] = [
  { label: '1M', value: '+2.4%' },
  { label: '3M', value: '+5.1%' },
  { label: '6M', value: '+8.7%' },
  { label: '1Y', value: '+10.6%' },
  { label: 'All', value: '+23.4%' },
];

const MONTHS: MonthBar[] = [
  { month: 'Sep', percent: 40 },
  { month: 'Oct', percent: 62 },
  { month: 'Nov', percent: 55 },
  { month: 'Dec', percent: 28 },
  { month: 'Jan', percent: 35 },
  { month: 'Feb', percent: 30 },
  { month: 'Mar', percent: 44 },
  { month: 'Apr', percent: 50 },
  { month: 'May', percent: 60 },
  { month: 'Jun', percent: 52 },
  { month: 'Jul', percent: 38 },
  { month: 'Aug', percent: 45 },
];

export const PerformanceTemplate: FC = () => {
  const [range, setRange] = useState<Range>(RANGES[0]);

  const selected =
    RANGES.find((item) => item.label === range.label) ?? RANGES[0];

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Returns over time for your portfolio.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {RANGES.map((item) => (
              <button
                key={item.label}
                onClick={() => setRange(item)}
                className={`tab ${range.label === item.label ? 'tab-active' : ''}`}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="text-right">
            <p className="text-base-content/50 text-xs">
              Return over {selected.label}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {selected.value}
            </p>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <FiBarChart />
                Monthly returns
              </h2>
              <p className="text-base-content/50 text-xs">12 months</p>
            </div>
            <div className="flex h-40 items-end gap-1">
              {MONTHS.map((month) => (
                <div
                  key={month.month}
                  className="flex h-full flex-1 flex-col justify-end">
                  <div
                    className="bg-primary/70 w-full rounded-t"
                    style={{ height: `${month.percent}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-1">
              {MONTHS.map((month) => (
                <div
                  key={month.month}
                  className="flex-1 text-center text-[10px]">
                  {month.month}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <p className="text-base-content/50 flex items-center gap-1 text-xs">
                <FiTrendingUp />
                Best month
              </p>
              <p className="text-2xl font-bold tracking-tight">+6.2% (Nov)</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <p className="text-base-content/50 flex items-center gap-1 text-xs">
                <FiTrendingDown />
                Worst month
              </p>
              <p className="text-2xl font-bold tracking-tight">-3.1% (Sep)</p>
            </div>
          </div>
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              <p className="text-base-content/50 text-xs">Annual return</p>
              <p className="text-2xl font-bold tracking-tight">+10.6%</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

PerformanceTemplate.displayName = 'PerformanceTemplate';
