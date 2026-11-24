'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlay, FiStar } from 'react-icons/fi';

type FeaturedType = 'Movie' | 'Series';

interface FeaturedTitle {
  id: string;
  title: string;
  type: FeaturedType;
  year: number;
  rating: string;
}

const FEATURED: FeaturedTitle[] = [
  { id: 'f1', title: 'Neon Horizon', type: 'Movie', year: 2026, rating: '4.8' },
  {
    id: 'f2',
    title: 'The Last Signal',
    type: 'Series',
    year: 2025,
    rating: '4.6',
  },
  {
    id: 'f3',
    title: 'Echoes of Tomorrow',
    type: 'Movie',
    year: 2026,
    rating: '4.5',
  },
  {
    id: 'f4',
    title: 'Crimson Orbit',
    type: 'Series',
    year: 2024,
    rating: '4.7',
  },
];

const typeBadgeClass = (type: FeaturedType) =>
  type === 'Movie' ? 'badge-neutral' : 'badge-warning';

export const StreamingHomeTemplate: FC = () => {
  const [watching, setWatching] = useState<Record<string, boolean>>({});

  const toggleWatch = (id: string) => {
    setWatching((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Streaming</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Featured and trending.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {FEATURED.length} featured titles
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURED.map((item) => (
            <div
              key={item.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span
                    className={`badge ${typeBadgeClass(item.type)} badge-sm`}>
                    {item.type}
                  </span>
                </div>
                <div className="text-base-content/50 flex items-center gap-3 text-xs">
                  <span>{item.year}</span>
                  <span className="flex items-center gap-1">
                    <FiStar />
                    {item.rating} rating
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {watching[item.id] && (
                    <span className="badge badge-info badge-sm">Watching</span>
                  )}
                  <button
                    onClick={() => toggleWatch(item.id)}
                    className="btn btn-primary btn-sm gap-1">
                    <FiPlay />
                    {watching[item.id] ? 'Watching' : 'Watch'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

StreamingHomeTemplate.displayName = 'StreamingHomeTemplate';
