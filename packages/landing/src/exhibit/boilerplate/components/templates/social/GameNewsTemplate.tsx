'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiZap } from 'react-icons/fi';

type Category = 'Patch' | 'Esports' | 'Community';

interface Story {
  id: string;
  headline: string;
  category: Category;
  date: string;
  summary: string;
}

const STORIES: Story[] = [
  {
    id: 's1',
    headline: 'Stellar Vanguard patch 2.1 launches next week',
    category: 'Patch',
    date: 'Aug 4, 2026',
    summary:
      'The update rebalances three heroes and adds a new ranked map rotation.',
  },
  {
    id: 's2',
    headline: 'Nova Online announces global invitational',
    category: 'Esports',
    date: 'Aug 2, 2026',
    summary:
      'Top teams from six regions will compete for a $100,000 prize pool.',
  },
  {
    id: 's3',
    headline: 'Ironforge Realms community event recap',
    category: 'Community',
    date: 'Jul 28, 2026',
    summary:
      'Players submitted over 2,000 arena designs for the summer contest.',
  },
  {
    id: 's4',
    headline: 'Phantom Ops drops a surprise battle pass',
    category: 'Patch',
    date: 'Aug 5, 2026',
    summary: 'Season 7 adds new cosmetics and a limited-time event mode.',
  },
];

const categoryBadgeClass = (category: Category) => {
  switch (category) {
    case 'Patch':
      return 'badge-warning';
    case 'Esports':
      return 'badge-info';
    default:
      return 'badge-ghost';
  }
};

export const GameNewsTemplate: FC = () => {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggleOpen = (id: string) => {
    setOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Game News</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Patches, events, and esports.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {STORIES.length} stories
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {STORIES.map((story) => (
            <div
              key={story.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold">{story.headline}</p>
                  <span
                    className={`badge ${categoryBadgeClass(story.category)} badge-sm`}>
                    {story.category}
                  </span>
                </div>
                <p className="text-base-content/50 flex items-center gap-1 text-xs">
                  <FiCalendar />
                  {story.date}
                </p>
                {open[story.id] && (
                  <p className="bg-base-100/50 rounded-lg p-3 text-xs leading-relaxed">
                    {story.summary}
                  </p>
                )}
                <button
                  onClick={() => toggleOpen(story.id)}
                  className="btn btn-ghost btn-xs w-fit gap-1">
                  <FiZap />
                  {open[story.id] ? 'Show less' : 'Read more'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

GameNewsTemplate.displayName = 'GameNewsTemplate';
