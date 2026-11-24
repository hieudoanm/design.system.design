'use client';

import type { FC } from 'react';
import { useState } from 'react';

const STAGES = ['Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] as const;
type Stage = (typeof STAGES)[number];

interface Deal {
  id: string;
  name: string;
  value: number;
  stage: Stage;
}

const DEALS: Deal[] = [
  { id: 'd1', name: 'Enterprise Onboarding', value: 48000, stage: 'Qualified' },
  { id: 'd2', name: 'Expansion Package', value: 21500, stage: 'Qualified' },
  { id: 'd3', name: 'Managed Support', value: 12000, stage: 'Proposal' },
  { id: 'd4', name: 'Security Audit', value: 8750, stage: 'Proposal' },
  { id: 'd5', name: 'Data Migration', value: 26400, stage: 'Negotiation' },
  { id: 'd6', name: 'Annual Renewal', value: 35000, stage: 'Won' },
  { id: 'd7', name: 'New Brand Site', value: 9200, stage: 'Lost' },
];

const renderDealActions = (deal: Deal, onAdvance: (id: string) => void) => {
  if (deal.stage === 'Won') {
    return <span className="badge badge-success badge-sm mt-3">Won</span>;
  }
  if (deal.stage === 'Lost') {
    return <span className="badge badge-error badge-sm mt-3">Lost</span>;
  }
  return (
    <button
      type="button"
      onClick={() => onAdvance(deal.id)}
      className="btn btn-ghost btn-xs mt-3">
      Advance
    </button>
  );
};

export const PipelineTemplate: FC = () => {
  const [deals, setDeals] = useState<Deal[]>(DEALS);

  const advanceDeal = (id: string) => {
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== id) {
          return deal;
        }
        const next = STAGES[STAGES.indexOf(deal.stage) + 1];
        return next ? { ...deal, stage: next } : deal;
      })
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Pipeline</h1>
        <p className="text-base-content/50 mt-1 text-sm">Deals by stage.</p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <p className="text-base-content/50 mb-6 text-sm">
          {deals.length} deals
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage) => (
            <div
              key={stage}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-4">
                <h2 className="text-base-content/50 text-xs font-medium tracking-wider uppercase">
                  {stage}
                </h2>
                <div className="flex flex-col gap-3">
                  {deals
                    .filter((deal) => deal.stage === stage)
                    .map((deal) => (
                      <div
                        key={deal.id}
                        className="bg-base-100 border-base-content/10 rounded-xl border p-4">
                        <p className="text-sm font-medium">{deal.name}</p>
                        <p className="text-base-content/50 mt-1 text-sm">
                          ${deal.value.toLocaleString()}
                        </p>
                        {renderDealActions(deal, advanceDeal)}
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

PipelineTemplate.displayName = 'PipelineTemplate';
