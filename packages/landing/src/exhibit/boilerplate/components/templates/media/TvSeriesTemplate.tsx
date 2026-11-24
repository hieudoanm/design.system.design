'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiPlus, FiStar } from 'react-icons/fi';

interface Series {
  id: string;
  title: string;
  seasons: number;
  episodes: number;
  rating: string;
}

const SERIES: Series[] = [
  { id: 's1', title: 'Iron Sky', seasons: 3, episodes: 24, rating: '4.7' },
  { id: 's2', title: 'Glass Harbor', seasons: 2, episodes: 16, rating: '4.5' },
  {
    id: 's3',
    title: 'The Quiet Divide',
    seasons: 5,
    episodes: 40,
    rating: '4.8',
  },
  { id: 's4', title: 'Rust & Petals', seasons: 1, episodes: 8, rating: '4.3' },
];

export const TvSeriesTemplate: FC = () => {
  const [added, setAdded] = useState<Record<string, boolean>>({});

  const toggleAdded = (id: string) => {
    setAdded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Series</h1>
        <p className="text-base-content/50 mt-1 text-sm">Browse TV shows.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {SERIES.length} series
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SERIES.map((item) => (
            <div
              key={item.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span className="badge badge-warning badge-sm">Series</span>
                </div>
                <div className="text-base-content/50 flex items-center gap-3 text-xs">
                  <span>
                    {item.seasons} season{item.seasons === 1 ? '' : 's'}
                  </span>
                  <span>
                    {item.episodes} episode{item.episodes === 1 ? '' : 's'}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiStar />
                    {item.rating} rating
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {added[item.id] && (
                    <span className="badge badge-success badge-sm">Added</span>
                  )}
                  <button
                    onClick={() => toggleAdded(item.id)}
                    className="btn btn-outline btn-sm gap-1">
                    {added[item.id] ? <FiCheck /> : <FiPlus />}
                    {added[item.id] ? 'Added' : 'My list'}
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

TvSeriesTemplate.displayName = 'TvSeriesTemplate';
