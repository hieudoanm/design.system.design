'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

type ResultType = 'Movie' | 'Series';

interface SearchResult {
  id: string;
  title: string;
  type: ResultType;
}

const CATALOG: SearchResult[] = [
  { id: 'r1', title: 'Neon Horizon', type: 'Movie' },
  { id: 'r2', title: 'The Last Signal', type: 'Series' },
  { id: 'r3', title: 'Iron Sky', type: 'Series' },
  { id: 'r4', title: 'Starfall Protocol', type: 'Movie' },
  { id: 'r5', title: 'Midnight Courier', type: 'Movie' },
  { id: 'r6', title: 'Glass Harbor', type: 'Series' },
];

const typeBadgeClass = (type: ResultType) =>
  type === 'Movie' ? 'badge-neutral' : 'badge-warning';

export const StreamingSearchTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const filtered = CATALOG.filter((item) =>
    item.title.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Find movies and shows.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="relative w-full sm:w-96">
            <FiSearch className="text-base-content/50 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              aria-label="Search titles"
              placeholder="Search titles..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
        </div>

        <p className="text-base-content/50 mb-4 text-sm">
          {filtered.length} results
        </p>
        {filtered.length === 0 ? (
          <p className="text-base-content/50 text-sm">
            No results for &quot;{query.trim()}&quot;
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex-row items-center justify-between gap-3 p-5">
                  <p className="text-sm font-medium">{item.title}</p>
                  <span
                    className={`badge ${typeBadgeClass(item.type)} badge-sm`}>
                    {item.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

StreamingSearchTemplate.displayName = 'StreamingSearchTemplate';
