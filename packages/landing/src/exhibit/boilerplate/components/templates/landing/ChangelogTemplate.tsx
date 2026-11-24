'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';

type ChangeType = 'added' | 'changed' | 'fixed';

interface Change {
  type: ChangeType;
  note: string;
}

interface Release {
  version: string;
  date: string;
  changes: Change[];
}

const TYPES: { id: ChangeType; label: string }[] = [
  { id: 'added', label: 'Added' },
  { id: 'changed', label: 'Changed' },
  { id: 'fixed', label: 'Fixed' },
];

const RELEASES: Release[] = [
  {
    version: 'v1.4.0',
    date: 'Aug 4, 2026',
    changes: [
      { type: 'added', note: 'Dark mode for the dashboard.' },
      { type: 'added', note: 'Export reports to CSV.' },
      { type: 'changed', note: 'Faster search across projects.' },
      { type: 'fixed', note: 'Resolved an issue with stale notifications.' },
    ],
  },
  {
    version: 'v1.3.1',
    date: 'Jul 22, 2026',
    changes: [{ type: 'fixed', note: 'Fixed a crash when editing comments.' }],
  },
  {
    version: 'v1.3.0',
    date: 'Jul 15, 2026',
    changes: [
      { type: 'added', note: 'Team activity feed.' },
      { type: 'changed', note: 'Redesigned the onboarding flow.' },
    ],
  },
];

export const ChangelogTemplate: FC = () => {
  const [filter, setFilter] = useState<ChangeType | 'all'>('all');

  const visible = RELEASES.map((release) => ({
    ...release,
    changes:
      filter === 'all'
        ? release.changes
        : release.changes.filter((change) => change.type === filter),
  })).filter((release) => release.changes.length > 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-24">
        <span className="badge badge-neutral mb-6 rounded-full">Changelog</span>
        <h1 className="mb-4 text-4xl md:text-5xl">What&apos;s new</h1>
        <p className="text-base-content/60 mb-10 text-sm">
          Product updates, improvements, and fixes.
        </p>

        <div className="tabs tabs-boxed tabs-sm mb-10 w-fit">
          {[{ id: 'all' as const, label: 'All' }, ...TYPES].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`tab ${filter === item.id ? 'tab-active' : ''}`}>
              {item.label}
            </button>
          ))}
        </div>

        {visible.length === 0 ? (
          <p className="text-base-content/50 text-sm">No matching changes</p>
        ) : (
          <div className="flex flex-col gap-10">
            {visible.map((release) => (
              <section key={release.version}>
                <div className="mb-4 flex items-baseline gap-3">
                  <h2 className="text-xl">{release.version}</h2>
                  <span className="text-base-content/50 text-xs">
                    {release.date}
                  </span>
                </div>
                <ul className="flex flex-col gap-2">
                  {release.changes.map((change) => (
                    <li
                      key={`${release.version}-${change.note}`}
                      className="border-base-content/10 bg-base-200 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm">
                      <span
                        className={`badge badge-sm ${
                          change.type === 'added'
                            ? 'badge-success'
                            : change.type === 'changed'
                              ? 'badge-info'
                              : 'badge-warning'
                        }`}>
                        {change.type}
                      </span>
                      {change.note}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/landing/privacy"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Privacy
            </Link>
            <Link
              href="/landing/terms"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Terms
            </Link>
            <Link
              href="/landing/contact"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

ChangelogTemplate.displayName = 'ChangelogTemplate';
