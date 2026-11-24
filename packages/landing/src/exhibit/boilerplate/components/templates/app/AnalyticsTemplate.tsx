'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiBarChart2,
  FiDollarSign,
  FiPackage,
  FiTrendingUp,
  FiUsers,
} from 'react-icons/fi';

type Range = '7' | '30';

interface Stat {
  label: string;
  value: string;
  trend: string;
  up: boolean;
  icon: React.ReactNode;
}

interface TopPage {
  page: string;
  views: string;
  bounce: string;
  status: string;
}

const STATS: Stat[] = [
  {
    label: 'Revenue',
    value: '$12,480',
    trend: '+18.2%',
    up: true,
    icon: <FiDollarSign />,
  },
  {
    label: 'Users',
    value: '8,291',
    trend: '+6.4%',
    up: true,
    icon: <FiUsers />,
  },
  {
    label: 'Orders',
    value: '1,204',
    trend: '-2.1%',
    up: false,
    icon: <FiPackage />,
  },
  {
    label: 'Conversion',
    value: '3.9%',
    trend: '+0.7%',
    up: true,
    icon: <FiTrendingUp />,
  },
];

const WEEKLY_BARS = [42, 58, 35, 72, 64, 80, 55];
const MONTHLY_BARS = [48, 62, 40, 78, 69, 88, 60];

const TOP_PAGES: TopPage[] = [
  { page: '/home', views: '12.4k', bounce: '42%', status: 'Growing' },
  { page: '/pricing', views: '8.1k', bounce: '38%', status: 'Growing' },
  { page: '/blog', views: '5.3k', bounce: '55%', status: 'Stable' },
  { page: '/docs', views: '3.9k', bounce: '61%', status: 'Declining' },
];

const getTrendBadge = (status: string) => {
  if (status === 'Growing') {
    return <span className="badge badge-success badge-sm">{status}</span>;
  }
  if (status === 'Declining') {
    return <span className="badge badge-error badge-sm">{status}</span>;
  }
  return <span className="badge badge-neutral badge-sm">{status}</span>;
};

const StatCard: FC<Stat> = ({ label, value, trend, up, icon }) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body flex-row items-center gap-4 p-5">
      <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base-content/50 text-xs">{label}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className={`text-xs ${up ? 'text-success' : 'text-error'}`}>
          {trend}
        </p>
      </div>
    </div>
  </div>
);

export const AnalyticsTemplate: FC = () => {
  const [range, setRange] = useState<Range>('7');

  const bars = range === '7' ? WEEKLY_BARS : MONTHLY_BARS;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track revenue, users, orders and traffic performance.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STATS.map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              up={stat.up}
              icon={stat.icon}
            />
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-6 border">
          <div className="card-body p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiBarChart2 className="text-base-content/50 h-4 w-4" />
                <h3 className="font-semibold">Visits</h3>
              </div>
              <div className="tabs tabs-boxed tabs-sm">
                <button
                  onClick={() => setRange('7')}
                  className={`tab ${range === '7' ? 'tab-active' : ''}`}>
                  7 days
                </button>
                <button
                  onClick={() => setRange('30')}
                  className={`tab ${range === '30' ? 'tab-active' : ''}`}>
                  30 days
                </button>
              </div>
            </div>
            <div className="flex h-40 items-end gap-2">
              {bars.map((value, idx) => (
                <div
                  key={idx}
                  className="flex flex-1 flex-col items-center gap-1">
                  <div
                    role="img"
                    aria-label={`Day ${idx + 1}: ${value}`}
                    style={{ height: `${value}%` }}
                    className={`w-full max-w-8 rounded-t ${
                      idx === bars.length - 1
                        ? 'bg-primary'
                        : 'bg-base-content/40'
                    }`}
                  />
                  <span className="text-base-content/40 text-[10px]">
                    D{idx + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-6 border">
          <div className="card-body p-0">
            <div className="border-base-content/10 border-b px-5 py-4">
              <h3 className="font-semibold">Top pages</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-5 py-3 font-medium">Page</th>
                    <th className="px-5 py-3 font-medium">Views</th>
                    <th className="px-5 py-3 font-medium">Bounce rate</th>
                    <th className="px-5 py-3 font-medium">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {TOP_PAGES.map((row) => (
                    <tr
                      key={row.page}
                      className="border-base-content/10 border-b">
                      <td className="px-5 py-3 font-mono text-sm">
                        {row.page}
                      </td>
                      <td className="px-5 py-3 text-sm">{row.views}</td>
                      <td className="px-5 py-3 text-sm">{row.bounce}</td>
                      <td className="px-5 py-3">{getTrendBadge(row.status)}</td>
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

AnalyticsTemplate.displayName = 'AnalyticsTemplate';
