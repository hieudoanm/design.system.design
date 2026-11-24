'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiFileText } from 'react-icons/fi';

interface Policy {
  id: string;
  title: string;
  category: string;
  updated: string;
  summary: string;
}

const POLICIES: Policy[] = [
  {
    id: 'po1',
    title: 'Code of conduct',
    category: 'Behavior',
    updated: 'Jan 2026',
    summary: 'Outlines expected behavior and reporting channels.',
  },
  {
    id: 'po2',
    title: 'Remote work',
    category: 'Workplace',
    updated: 'Feb 2026',
    summary: 'Guidelines for distributed work and core hours.',
  },
  {
    id: 'po3',
    title: 'PTO policy',
    category: 'Leave',
    updated: 'Mar 2026',
    summary: 'Accrual, approval, and carryover rules.',
  },
  {
    id: 'po4',
    title: 'Expense policy',
    category: 'Finance',
    updated: 'Apr 2026',
    summary: 'Reimbursement process and spending limits.',
  },
  {
    id: 'po5',
    title: 'Data security',
    category: 'Security',
    updated: 'May 2026',
    summary: 'Handling sensitive data and access controls.',
  },
  {
    id: 'po6',
    title: 'Parental leave',
    category: 'Leave',
    updated: 'Jun 2026',
    summary: 'Leave entitlements and return-to-work support.',
  },
];

export const PoliciesTemplate: FC = () => {
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const query = search.trim().toLowerCase();

  const visible = POLICIES.filter((policy) =>
    policy.title.toLowerCase().includes(query)
  );

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Policies</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Company policies and handbooks.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiFileText />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Policies</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} policies
              </p>
            </div>
          </div>
        </div>

        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search policies..."
          aria-label="Search policies"
          className="input input-bordered input-sm mb-6 w-full sm:max-w-xs"
        />

        {visible.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No policies found
          </p>
        ) : (
          <div className="space-y-4">
            {visible.map((policy) => (
              <div
                key={policy.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {policy.title}
                      </p>
                      <p className="text-base-content/50 mt-0.5 text-xs">
                        Updated {policy.updated}
                      </p>
                    </div>
                    <span className="badge badge-ghost badge-sm shrink-0">
                      {policy.category}
                    </span>
                  </div>
                  {expandedId === policy.id && (
                    <p className="text-base-content/50 mt-3 text-sm">
                      {policy.summary}
                    </p>
                  )}
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => toggle(policy.id)}
                      className="btn btn-ghost btn-xs">
                      {expandedId === policy.id ? 'Close' : 'Read'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

PoliciesTemplate.displayName = 'PoliciesTemplate';
