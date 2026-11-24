'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiBarChart2,
  FiDollarSign,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';

type Period = 'This month' | 'This quarter' | 'This year';

interface PeriodData {
  revenue: number;
  deals: number;
  winRate: number;
  pipeline: number;
}

const DATA: Record<Period, PeriodData> = {
  'This month': { revenue: 84200, deals: 18, winRate: 34, pipeline: 210000 },
  'This quarter': { revenue: 312500, deals: 61, winRate: 38, pipeline: 640000 },
  'This year': { revenue: 1180000, deals: 214, winRate: 41, pipeline: 1500000 },
};

const PERIODS: Period[] = ['This month', 'This quarter', 'This year'];

export const SalesReportsTemplate: FC = () => {
  const [period, setPeriod] = useState<Period>('This month');

  const data = DATA[period];

  const stats = [
    {
      label: 'Revenue',
      value: `$${data.revenue.toLocaleString()}`,
      icon: FiDollarSign,
    },
    { label: 'Deals', value: `${data.deals}`, icon: FiTarget },
    { label: 'Win rate', value: `${data.winRate}%`, icon: FiTrendingUp },
    {
      label: 'Pipeline',
      value: `$${data.pipeline.toLocaleString()}`,
      icon: FiBarChart2,
    },
  ];

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Sales Reports</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Performance overview.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {PERIODS.map((item) => (
            <button
              key={item}
              onClick={() => setPeriod(item)}
              className={`tab ${period === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="flex items-center gap-2">
                    <Icon className="text-primary" />
                    <p className="text-base-content/50 text-xs">{stat.label}</p>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-base-content/50 mt-6 text-sm">{period} report</p>
      </main>
    </div>
  );
};

SalesReportsTemplate.displayName = 'SalesReportsTemplate';
