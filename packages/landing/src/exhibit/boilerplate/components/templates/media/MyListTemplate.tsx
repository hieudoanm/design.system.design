'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBookmark, FiTrash2 } from 'react-icons/fi';

type SavedType = 'Movie' | 'Series';

interface SavedTitle {
  id: string;
  title: string;
  type: SavedType;
}

const SAVED_TITLES: SavedTitle[] = [
  { id: 'm1', title: 'Starfall Protocol', type: 'Movie' },
  { id: 'm2', title: 'Iron Sky', type: 'Series' },
  { id: 'm3', title: 'Midnight Courier', type: 'Movie' },
  { id: 'm4', title: 'Glass Harbor', type: 'Series' },
];

const typeBadgeClass = (type: SavedType) =>
  type === 'Movie' ? 'badge-neutral' : 'badge-warning';

export const MyListTemplate: FC = () => {
  const [titles, setTitles] = useState<SavedTitle[]>(SAVED_TITLES);

  const removeTitle = (id: string) => {
    setTitles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">My List</h1>
        <p className="text-base-content/50 mt-1 text-sm">Titles you saved.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {titles.length} titles
        </p>
        {titles.length === 0 ? (
          <p className="text-base-content/50 text-sm">Your list is empty</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {titles.map((item) => (
              <div
                key={item.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex-row items-center justify-between gap-3 p-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FiBookmark className="text-base-content/50 shrink-0" />
                    <div>
                      <p className="truncate text-sm font-medium">
                        {item.title}
                      </p>
                      <span
                        className={`badge ${typeBadgeClass(item.type)} badge-sm`}>
                        {item.type}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTitle(item.id)}
                    aria-label={`Remove ${item.title}`}
                    className="btn btn-ghost btn-xs gap-1">
                    <FiTrash2 />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

MyListTemplate.displayName = 'MyListTemplate';
