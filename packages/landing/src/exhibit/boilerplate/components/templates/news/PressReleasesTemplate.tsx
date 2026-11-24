'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiFileText,
} from 'react-icons/fi';

interface PressRelease {
  id: string;
  title: string;
  date: string;
  category: string;
  summary: string;
}

const RELEASES: PressRelease[] = [
  {
    id: 'p1',
    title: 'Acme Corp Launches Renewable Energy Division',
    date: 'Jul 30, 2026',
    category: 'Company',
    summary:
      'Acme Corp announced a new division focused on solar and wind projects, backed by a $500M investment over three years.',
  },
  {
    id: 'p2',
    title: 'Northwind Partners Acquires Atlas Logistics',
    date: 'Aug 2, 2026',
    category: 'M&A',
    summary:
      'Northwind Partners has completed the acquisition of Atlas Logistics, expanding its freight network across Europe and Asia.',
  },
  {
    id: 'p3',
    title: 'Quantum Soft Reports Q2 Earnings Growth',
    date: 'Aug 4, 2026',
    category: 'Earnings',
    summary:
      'Quantum Soft reported a 24% increase in quarterly revenue, driven by strong demand for its enterprise security platform.',
  },
  {
    id: 'p4',
    title: 'Helios Energy Announces New Chief Technology Officer',
    date: 'Jul 28, 2026',
    category: 'People',
    summary:
      'Helios Energy appointed Dr. Amara Diallo as Chief Technology Officer to lead its grid-scale battery research program.',
  },
  {
    id: 'p5',
    title: 'Vertex Systems Wins National Innovation Award',
    date: 'Jul 25, 2026',
    category: 'Awards',
    summary:
      'Vertex Systems was recognized with a National Innovation Award for its real-time collaboration platform used by 40,000 teams.',
  },
];

export const PressReleasesTemplate: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((current) => (current === id ? null : id));

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Press Releases</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Official company announcements.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 flex items-center gap-1.5 text-sm">
          <FiFileText className="h-3.5 w-3.5" />
          {RELEASES.length} press releases
        </p>

        <div className="flex flex-col gap-4">
          {RELEASES.map((release) => {
            const isOpen = expandedId === release.id;
            return (
              <article
                key={release.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex flex-col gap-2 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="badge badge-ghost badge-sm">
                      {release.category}
                    </span>
                    <button
                      onClick={() => toggle(release.id)}
                      className="btn btn-ghost btn-xs gap-1">
                      {isOpen ? 'Close' : 'Read release'}
                      {isOpen ? (
                        <FiChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <FiChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <h2 className="text-base font-semibold">{release.title}</h2>
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiCalendar className="h-3 w-3" />
                    {release.date}
                  </p>
                  {isOpen && (
                    <p className="text-base-content/70 text-sm">
                      {release.summary}
                    </p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

PressReleasesTemplate.displayName = 'PressReleasesTemplate';
