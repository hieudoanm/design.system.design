'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSearch, FiTag } from 'react-icons/fi';

interface NewsCategory {
  id: string;
  name: string;
  count: number;
  color: string;
}

const CATEGORIES: NewsCategory[] = [
  { id: 'c1', name: 'World News', count: 42, color: 'badge-info' },
  { id: 'c2', name: 'Technology', count: 24, color: 'badge-success' },
  { id: 'c3', name: 'Business', count: 31, color: 'badge-warning' },
  { id: 'c4', name: 'Sports', count: 18, color: 'badge-neutral' },
  { id: 'c5', name: 'Culture', count: 12, color: 'badge-error' },
  { id: 'c6', name: 'Health', count: 15, color: 'badge-ghost' },
];

export const NewsCategoriesTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const filtered = CATEGORIES.filter((category) =>
    category.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Browse news by topic.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <FiSearch className="text-base-content/40 absolute top-2 left-3" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search categories..."
              aria-label="Search categories"
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
          <p className="text-base-content/50 text-sm">
            {filtered.length} categories
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-3 rounded-2xl border p-12 text-center">
            <FiTag className="text-base-content/20 h-8 w-8" />
            <p className="text-base-content/50 text-sm">No categories found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((category) => (
              <div
                key={category.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex flex-row items-center justify-between gap-3 p-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-semibold">{category.name}</h2>
                    <p className="text-base-content/50 text-xs">
                      {category.count} articles
                    </p>
                  </div>
                  <span className={`badge ${category.color} badge-sm`}>
                    {category.name}
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

NewsCategoriesTemplate.displayName = 'NewsCategoriesTemplate';
