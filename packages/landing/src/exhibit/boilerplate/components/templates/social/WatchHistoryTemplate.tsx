'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiClock, FiTrash2 } from 'react-icons/fi';

type HistoryType = 'Movie' | 'Series';

interface HistoryEntry {
  id: string;
  title: string;
  type: HistoryType;
  date: string;
  progress: string;
}

const HISTORY: HistoryEntry[] = [
  {
    id: 'h1',
    title: 'Starfall Protocol',
    type: 'Movie',
    date: 'Aug 3, 2026',
    progress: 'Completed',
  },
  {
    id: 'h2',
    title: 'Iron Sky',
    type: 'Series',
    date: 'Jul 28, 2026',
    progress: '45%',
  },
  {
    id: 'h3',
    title: 'Neon Horizon',
    type: 'Movie',
    date: 'Jul 21, 2026',
    progress: 'Completed',
  },
  {
    id: 'h4',
    title: 'Midnight Courier',
    type: 'Movie',
    date: 'Jul 15, 2026',
    progress: '10%',
  },
  {
    id: 'h5',
    title: 'Glass Harbor',
    type: 'Series',
    date: 'Jul 9, 2026',
    progress: 'Completed',
  },
];

const renderProgress = (progress: string) => {
  if (progress === 'Completed') {
    return <span className="badge badge-success badge-sm">Completed</span>;
  }
  return <span className="text-base-content/50 text-sm">{progress}</span>;
};

const typeBadgeClass = (type: HistoryType) =>
  type === 'Movie' ? 'badge-neutral' : 'badge-warning';

export const WatchHistoryTemplate: FC = () => {
  const [entries, setEntries] = useState<HistoryEntry[]>(HISTORY);

  const clearHistory = () => {
    setEntries([]);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">History</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Everything you have watched.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-base-content/50 text-sm">
            {entries.length} watched titles
          </p>
          <button
            onClick={clearHistory}
            className="btn btn-outline btn-sm gap-1">
            <FiTrash2 />
            Clear history
          </button>
        </div>

        {entries.length === 0 ? (
          <p className="text-base-content/50 text-sm">No history</p>
        ) : (
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body divide-base-content/10 divide-y p-4">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-2">
                  <div>
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="text-base-content/50 flex items-center gap-1 text-xs">
                      <FiCalendar />
                      {entry.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${typeBadgeClass(entry.type)} badge-sm`}>
                      {entry.type}
                    </span>
                    <span className="flex items-center gap-1 text-xs">
                      <FiClock />
                      {renderProgress(entry.progress)}
                    </span>
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

WatchHistoryTemplate.displayName = 'WatchHistoryTemplate';
