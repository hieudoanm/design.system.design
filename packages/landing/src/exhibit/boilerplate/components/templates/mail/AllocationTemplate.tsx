'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPieChart } from 'react-icons/fi';

interface AssetAllocation {
  name: string;
  value: string;
  percent: number;
  color: string;
}

const ASSETS: AssetAllocation[] = [
  { name: 'Stocks', value: '$61,656', percent: 48, color: 'bg-primary' },
  { name: 'Bonds', value: '$28,259', percent: 22, color: 'bg-secondary' },
  { name: 'Cash', value: '$15,414', percent: 12, color: 'bg-accent' },
  { name: 'Crypto', value: '$17,983', percent: 14, color: 'bg-success' },
  { name: 'Real Estate', value: '$5,138', percent: 4, color: 'bg-warning' },
];

export const AllocationTemplate: FC = () => {
  const [selected, setSelected] = useState<string>(ASSETS[0].name);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Allocation</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          How your portfolio is distributed.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <FiPieChart />
                  Asset allocation
                </h2>
                <p className="text-base-content/50 text-xs">5 asset classes</p>
              </div>
              <span className="badge badge-primary badge-sm">Legend</span>
            </div>

            <ul className="space-y-4">
              {ASSETS.map((asset) => (
                <li key={asset.name}>
                  <button
                    onClick={() => setSelected(asset.name)}
                    aria-label={`Select ${asset.name}`}
                    className="flex w-full items-center gap-3 rounded-lg text-left">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${asset.color}`}
                    />
                    <span className="w-24 text-sm font-medium">
                      {asset.name}
                    </span>
                    <progress
                      className={`progress ${asset.color} h-2 flex-1`}
                      value={asset.percent}
                      max={100}
                    />
                    <span className="text-base-content/50 w-20 text-right text-xs">
                      {asset.value}
                    </span>
                    <span className="w-12 text-right text-xs">
                      {asset.percent}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>

            <p className="text-base-content/50 mt-5 text-sm">
              Details for {selected}
            </p>

            <div className="border-base-content/10 mt-4 flex items-center justify-between border-t pt-4">
              <span className="text-sm font-medium">Total allocation</span>
              <span className="badge badge-success badge-sm">
                100% allocated
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

AllocationTemplate.displayName = 'AllocationTemplate';
