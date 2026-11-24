'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import {
  FiBell,
  FiFolder,
  FiRefreshCw,
  FiSearch,
  FiShoppingCart,
} from 'react-icons/fi';

interface EmptyStateDemo {
  icon: FC<{ className?: string }>;
  title: string;
  description: string;
  action: string;
}

const STATES: EmptyStateDemo[] = [
  {
    icon: FiSearch,
    title: 'No results found',
    description: 'Try a different search term or clear your filters.',
    action: 'Clear filters',
  },
  {
    icon: FiBell,
    title: 'You are all caught up',
    description: 'New notifications will appear here.',
    action: 'Enable notifications',
  },
  {
    icon: FiFolder,
    title: 'No files yet',
    description: 'Upload your first file to get started.',
    action: 'Upload a file',
  },
  {
    icon: FiShoppingCart,
    title: 'Your cart is empty',
    description: 'Browse the catalog and add items to your cart.',
    action: 'Start shopping',
  },
];

const RECENT_ACTIVITY = [
  'Alice created the Q3 report',
  'Bob updated the roadmap',
  'Cara archived the old project',
];

export const EmptyStatesTemplate: FC = () => {
  const [hasActivity, setHasActivity] = useState(false);

  const toggleActivity = () => setHasActivity((prev) => !prev);

  return (
    <div className="bg-base-100 text-base-content flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 p-6">
        <div>
          <p className="text-primary text-xs tracking-[0.2em] uppercase">
            Empty states
          </p>
          <h1>Empty states</h1>
          <p className="text-base-content/50 text-sm">
            Friendly placeholders when there is no content yet.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {STATES.map((state) => {
            const Icon = state.icon;
            return (
              <div
                key={state.title}
                className="card border-base-content/10 bg-base-200 border">
                <div className="card-body p-5">
                  <span className="bg-base-300/40 mb-2 w-fit rounded-xl p-3">
                    <Icon className="text-base-content/40 h-6 w-6" />
                  </span>
                  <h3>{state.title}</h3>
                  <p className="text-base-content/50 text-sm">
                    {state.description}
                  </p>
                  <div className="mt-3">
                    {state.title === 'No files yet' ? (
                      <Link href="/upload" className="btn btn-primary btn-sm">
                        {state.action}
                      </Link>
                    ) : (
                      <button type="button" className="btn btn-ghost btn-sm">
                        {state.action}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card border-base-content/10 bg-base-200 border">
          <div className="card-body p-5">
            <div className="flex items-center justify-between">
              <h3>Recent activity</h3>
              <button
                type="button"
                onClick={toggleActivity}
                className="btn btn-primary btn-sm gap-1">
                <FiRefreshCw className="h-4 w-4" />
                {hasActivity ? 'Clear data' : 'Simulate data'}
              </button>
            </div>
            {hasActivity ? (
              <ul className="flex flex-col gap-2 text-sm">
                {RECENT_ACTIVITY.map((item) => (
                  <li
                    key={item}
                    className="bg-base-300/40 rounded-lg px-3 py-2">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 py-6 text-center">
                <FiRefreshCw className="text-base-content/40 h-6 w-6" />
                <p className="text-base-content/50 text-sm">
                  No recent activity to show.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

EmptyStatesTemplate.displayName = 'EmptyStatesTemplate';
