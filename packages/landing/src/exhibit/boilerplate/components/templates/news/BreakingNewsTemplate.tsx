'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiClock, FiZap } from 'react-icons/fi';

type StoryCategory = 'World' | 'Tech' | 'Business';
type CategoryFilter = 'All' | StoryCategory;

interface Story {
  id: string;
  headline: string;
  source: string;
  time: string;
  category: StoryCategory;
  verified: boolean;
}

const STORIES: Story[] = [
  {
    id: 's1',
    headline: 'Markets rally as central banks signal rate cuts',
    source: 'Reuters',
    time: '2h ago',
    category: 'World',
    verified: true,
  },
  {
    id: 's2',
    headline: 'Quantum computing breakthrough unveiled in Zurich',
    source: 'TechWire',
    time: '1h ago',
    category: 'Tech',
    verified: true,
  },
  {
    id: 's3',
    headline: 'Major shipping lane reopens after storm warning',
    source: 'AP News',
    time: '3h ago',
    category: 'World',
    verified: false,
  },
  {
    id: 's4',
    headline: 'Solid-state battery promises week-long phone charge',
    source: 'TechWire',
    time: '4h ago',
    category: 'Tech',
    verified: false,
  },
  {
    id: 's5',
    headline: 'Retail giant posts record quarterly revenue',
    source: 'Bloomberg',
    time: '2h ago',
    category: 'Business',
    verified: true,
  },
  {
    id: 's6',
    headline: 'Central bank tightens lending rules for startups',
    source: 'Financial Times',
    time: '6h ago',
    category: 'Business',
    verified: false,
  },
];

const FILTERS: CategoryFilter[] = ['All', 'World', 'Tech', 'Business'];

export const BreakingNewsTemplate: FC = () => {
  const [filter, setFilter] = useState<CategoryFilter>('All');

  const visible = STORIES.filter(
    (story) => filter === 'All' || story.category === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Breaking News</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Latest developments as they happen.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 flex items-center gap-1 text-sm">
            <FiZap className="h-3.5 w-3.5" />
            {visible.length} stories
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {visible.map((story) => (
            <article
              key={story.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex flex-col gap-2 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-ghost badge-sm">
                    {story.category}
                  </span>
                  {story.verified && (
                    <span className="badge badge-info badge-sm gap-1">
                      <FiCheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <h2 className="text-sm font-semibold">{story.headline}</h2>
                <p className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                  <span>{story.source}</span>
                  <span className="flex items-center gap-1">
                    <FiClock className="h-3 w-3" />
                    {story.time}
                  </span>
                </p>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

BreakingNewsTemplate.displayName = 'BreakingNewsTemplate';
