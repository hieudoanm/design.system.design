'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiDollarSign } from 'react-icons/fi';

type DealStage = 'Open' | 'Won' | 'Lost';

interface Deal {
  id: string;
  name: string;
  value: number;
  owner: string;
  stage: DealStage;
}

const DEALS: Deal[] = [
  {
    id: 'd1',
    name: 'Enterprise Onboarding',
    value: 48000,
    owner: 'Sarah Jones',
    stage: 'Open',
  },
  {
    id: 'd2',
    name: 'Managed Support',
    value: 12000,
    owner: 'Mike Brown',
    stage: 'Open',
  },
  {
    id: 'd3',
    name: 'Data Migration',
    value: 26400,
    owner: 'Sarah Jones',
    stage: 'Won',
  },
  {
    id: 'd4',
    name: 'Security Audit',
    value: 8750,
    owner: 'Tom Davis',
    stage: 'Won',
  },
  {
    id: 'd5',
    name: 'New Brand Site',
    value: 9200,
    owner: 'Mike Brown',
    stage: 'Lost',
  },
  {
    id: 'd6',
    name: 'Expansion Package',
    value: 21500,
    owner: 'Tom Davis',
    stage: 'Lost',
  },
];

const getStageBadge = (stage: DealStage) => {
  switch (stage) {
    case 'Open':
      return <span className="badge badge-info badge-sm">Open</span>;
    case 'Won':
      return <span className="badge badge-success badge-sm">Won</span>;
    default:
      return <span className="badge badge-error badge-sm">Lost</span>;
  }
};

export const DealsTemplate: FC = () => {
  const [deals, setDeals] = useState<Deal[]>(DEALS);

  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  const setStage = (id: string, stage: DealStage) => {
    setDeals((prev) =>
      prev.map((deal) => (deal.id === id ? { ...deal, stage } : deal))
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Deals</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track open and closed deals.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex items-center justify-end">
          <p className="text-base-content/50 text-sm">{deals.length} deals</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiDollarSign />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Total value</p>
              <p className="text-2xl font-bold tracking-tight">
                ${total.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 text-right font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Owner</th>
                    <th className="px-4 py-3 font-medium">Stage</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deals.map((deal) => (
                    <tr
                      key={deal.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {deal.name}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        ${deal.value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{deal.owner}</td>
                      <td className="px-4 py-3">{getStageBadge(deal.stage)}</td>
                      <td className="px-4 py-3">
                        {deal.stage === 'Open' && (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setStage(deal.id, 'Won')}
                              className="btn btn-ghost btn-xs">
                              Mark won
                            </button>
                            <button
                              type="button"
                              onClick={() => setStage(deal.id, 'Lost')}
                              className="btn btn-ghost btn-xs">
                              Mark lost
                            </button>
                          </div>
                        )}
                      </td>
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

DealsTemplate.displayName = 'DealsTemplate';
