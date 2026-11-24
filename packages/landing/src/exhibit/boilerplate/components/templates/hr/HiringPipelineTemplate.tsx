'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBriefcase } from 'react-icons/fi';

const STAGES = ['Applied', 'Interview', 'Offer', 'Hired'] as const;
type Stage = (typeof STAGES)[number];

interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: Stage;
}

const CANDIDATES: Candidate[] = [
  {
    id: 'c1',
    name: 'Ava Turner',
    role: 'Product Manager',
    stage: 'Applied',
  },
  {
    id: 'c2',
    name: 'Ethan Brooks',
    role: 'Data Analyst',
    stage: 'Interview',
  },
  {
    id: 'c3',
    name: 'Isla Nguyen',
    role: 'QA Engineer',
    stage: 'Offer',
  },
  {
    id: 'c4',
    name: 'Lucas Meyer',
    role: 'Sales Rep',
    stage: 'Hired',
  },
  {
    id: 'c5',
    name: 'Chloe Adams',
    role: 'Designer',
    stage: 'Interview',
  },
  {
    id: 'c6',
    name: 'Henry Fox',
    role: 'Engineer',
    stage: 'Applied',
  },
];

export const HiringPipelineTemplate: FC = () => {
  const [candidates, setCandidates] = useState<Candidate[]>(CANDIDATES);

  const advance = (id: string) => {
    setCandidates((prev) =>
      prev.map((candidate) => {
        if (candidate.id !== id) {
          return candidate;
        }
        const index = STAGES.indexOf(candidate.stage);
        const next = STAGES[Math.min(index + 1, STAGES.length - 1)];
        return { ...candidate, stage: next };
      })
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Hiring Pipeline</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Candidates by stage.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiBriefcase />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Pipeline</p>
              <p className="text-2xl font-bold tracking-tight">
                {candidates.length} candidates
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage) => {
            const inStage = candidates.filter(
              (candidate) => candidate.stage === stage
            );
            return (
              <div
                key={stage}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{stage}</h3>
                    <span className="badge badge-ghost badge-sm">
                      {inStage.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {inStage.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-base-100 border-base-content/10 rounded-lg border p-3">
                        <p className="text-sm font-medium">{candidate.name}</p>
                        <p className="text-base-content/50 mb-3 text-xs">
                          {candidate.role}
                        </p>
                        {candidate.stage === 'Hired' ? (
                          <span className="badge badge-success badge-sm">
                            Hired
                          </span>
                        ) : (
                          <button
                            onClick={() => advance(candidate.id)}
                            className="btn btn-ghost btn-xs w-full">
                            Advance
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

HiringPipelineTemplate.displayName = 'HiringPipelineTemplate';
