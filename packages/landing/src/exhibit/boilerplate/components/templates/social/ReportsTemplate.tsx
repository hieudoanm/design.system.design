'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiDownload, FiFileText } from 'react-icons/fi';

type Range = '7d' | '30d' | '90d';

interface Report {
  id: string;
  name: string;
  description: string;
}

const REPORTS: Report[] = [
  {
    id: 'r1',
    name: 'Revenue summary',
    description: 'Monthly revenue breakdown by plan and region.',
  },
  {
    id: 'r2',
    name: 'User growth',
    description: 'New signups, activations and churn over time.',
  },
  {
    id: 'r3',
    name: 'Feature usage',
    description: 'Adoption rates for each product feature.',
  },
  {
    id: 'r4',
    name: 'Support performance',
    description: 'Ticket volume, response time and satisfaction.',
  },
];

const RANGES: { id: Range; label: string; days: number }[] = [
  { id: '7d', label: '7d', days: 7 },
  { id: '30d', label: '30d', days: 30 },
  { id: '90d', label: '90d', days: 90 },
];

export const ReportsTemplate: FC = () => {
  const [range, setRange] = useState<Range>('30d');

  const activeDays = RANGES.find((r) => r.id === range)?.days ?? 30;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Generate and export reports for your workspace.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center justify-between p-5">
            <div className="flex items-center gap-2">
              <FiFileText className="text-base-content/50 h-4 w-4" />
              <p className="text-sm">
                Generated for the last {activeDays} days
              </p>
            </div>
            <div className="tabs tabs-boxed tabs-sm">
              {RANGES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRange(r.id)}
                  className={`tab ${range === r.id ? 'tab-active' : ''}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REPORTS.map((report) => (
            <div
              key={report.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <h3 className="text-sm font-semibold">{report.name}</h3>
                <p className="text-base-content/50 text-sm">
                  {report.description}
                </p>
                <div className="mt-2 flex justify-end">
                  <button className="btn btn-outline btn-sm">
                    <FiDownload />
                    Export
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

ReportsTemplate.displayName = 'ReportsTemplate';
