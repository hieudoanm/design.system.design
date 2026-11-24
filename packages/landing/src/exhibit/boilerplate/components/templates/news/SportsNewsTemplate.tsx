'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock } from 'react-icons/fi';

type NewsCategory = 'Transfers' | 'Matchday' | 'Injury';

interface NewsStory {
  id: string;
  headline: string;
  category: NewsCategory;
  time: string;
  summary: string;
}

const NEWS: NewsStory[] = [
  {
    id: 'n1',
    headline: 'Riverside sign midfielder in club-record deal',
    category: 'Transfers',
    time: '3h ago',
    summary:
      'The midfielder arrives on a three-year contract from Atlas United.',
  },
  {
    id: 'n2',
    headline: 'Granite edge Lakeside in five-goal thriller',
    category: 'Matchday',
    time: '2h ago',
    summary: 'A stoppage-time winner sealed the 3-2 result at Granite Stadium.',
  },
  {
    id: 'n3',
    headline: 'Silva faces two weeks out with knee injury',
    category: 'Injury',
    time: '5h ago',
    summary: 'Scans confirmed the injury, ruling Silva out of three matches.',
  },
  {
    id: 'n4',
    headline: 'Atlas confirm season-long loan for defender',
    category: 'Transfers',
    time: '1h ago',
    summary:
      'The defender joins Atlas United with an option to buy next summer.',
  },
  {
    id: 'n5',
    headline: 'Northport host cup semi-final on Sunday',
    category: 'Matchday',
    time: '4h ago',
    summary: 'Kickoff is set for 15:00 with a sold-out crowd expected.',
  },
];

const categoryBadgeClass = (category: NewsCategory) => {
  if (category === 'Transfers') return 'badge-info';
  if (category === 'Matchday') return 'badge-success';
  return 'badge-error';
};

export const SportsNewsTemplate: FC = () => {
  const [read, setRead] = useState<Record<string, boolean>>({});

  const toggleRead = (id: string) => {
    setRead((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Sports News</h1>
        <p className="text-base-content/50 mt-1 text-sm">Latest headlines.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {NEWS.length} stories
        </p>

        <div className="flex flex-col gap-4">
          {NEWS.map((story) => {
            const expanded = Boolean(read[story.id]);
            return (
              <article
                key={story.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`badge ${categoryBadgeClass(story.category)} badge-sm`}>
                      {story.category}
                    </span>
                    <span className="text-base-content/50 flex items-center gap-1 text-xs">
                      <FiClock className="h-3 w-3" />
                      {story.time}
                    </span>
                  </div>
                  <h2 className="text-sm font-semibold">{story.headline}</h2>
                  {expanded && (
                    <p className="text-base-content/50 text-sm">
                      {story.summary}
                    </p>
                  )}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRead(story.id)}
                      className="btn btn-outline btn-sm">
                      {expanded ? 'Close' : 'Read'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>
    </div>
  );
};

SportsNewsTemplate.displayName = 'SportsNewsTemplate';
