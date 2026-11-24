'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiTrash2 } from 'react-icons/fi';

interface ContinueTitle {
  id: string;
  title: string;
  progress: number;
}

const CONTINUE_WATCHING: ContinueTitle[] = [
  { id: 'c1', title: 'Neon Horizon', progress: 65 },
  { id: 'c2', title: 'The Last Signal', progress: 30 },
  { id: 'c3', title: 'Crimson Orbit', progress: 80 },
  { id: 'c4', title: 'Echoes of Tomorrow', progress: 12 },
];

export const ContinueWatchingTemplate: FC = () => {
  const [titles, setTitles] = useState<ContinueTitle[]>(CONTINUE_WATCHING);

  const removeTitle = (id: string) => {
    setTitles((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Continue Watching</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Pick up where you left off.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {titles.length} titles
        </p>
        {titles.length === 0 ? (
          <p className="text-base-content/50 text-sm">Nothing to watch</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {titles.map((item) => (
              <div
                key={item.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FiClock className="text-base-content/50" />
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    <button
                      onClick={() => removeTitle(item.id)}
                      aria-label={`Remove ${item.title}`}
                      className="btn btn-ghost btn-xs gap-1">
                      <FiTrash2 />
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <progress
                      className="progress progress-primary flex-1"
                      value={item.progress}
                      max={100}
                    />
                    <span className="text-base-content/50 text-xs">
                      {item.progress}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

ContinueWatchingTemplate.displayName = 'ContinueWatchingTemplate';
