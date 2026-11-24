'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMusic, FiSearch } from 'react-icons/fi';

interface MusicResult {
  id: string;
  title: string;
  artist: string;
}

const MUSIC_RESULTS: MusicResult[] = [
  { id: 'm1', title: 'Golden Hour', artist: 'Aria Wells' },
  {
    id: 'm2',
    title: 'City Lights',
    artist: 'The Midnight Echo',
  },
  { id: 'm3', title: 'Wildflower', artist: 'Juno Park' },
  { id: 'm4', title: 'Open Road', artist: 'Delta Rivers' },
  { id: 'm5', title: 'Slow Motion', artist: 'Cora Lane' },
];

export const MusicSearchTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const normalized = query.trim().toLowerCase();
  const results = normalized
    ? MUSIC_RESULTS.filter(
        (result) =>
          result.title.toLowerCase().includes(normalized) ||
          result.artist.toLowerCase().includes(normalized)
      )
    : MUSIC_RESULTS;

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find songs and artists.
        </p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="relative mb-4">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search songs or artists..."
            aria-label="Search music"
            className="input input-bordered w-full pl-9"
          />
        </div>
        <p className="text-base-content/50 mb-4 text-sm">
          {results.length} results
        </p>

        {results.length === 0 ? (
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body items-center gap-2 p-10 text-center">
              <FiMusic className="text-base-content/20 h-8 w-8" />
              <p className="text-base-content/50 text-sm">
                No results for &quot;{query.trim()}&quot;
              </p>
            </div>
          </div>
        ) : (
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-0">
              {results.map((result) => (
                <div
                  key={result.id}
                  className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                  <FiMusic className="text-base-content/30 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{result.title}</p>
                    <p className="text-base-content/50 text-xs">
                      {result.artist}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

MusicSearchTemplate.displayName = 'MusicSearchTemplate';
