'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPlay, FiRadio, FiUsers } from 'react-icons/fi';

interface Channel {
  id: string;
  name: string;
  category: string;
  viewers: string;
}

const CHANNELS: Channel[] = [
  { id: 'ch1', name: 'Orbit News', category: 'News', viewers: '12.4K' },
  { id: 'ch2', name: 'Stadium Prime', category: 'Sports', viewers: '1.2K' },
  { id: 'ch3', name: 'Cosmos Docs', category: 'Documentary', viewers: '830' },
  { id: 'ch4', name: 'Retro Films', category: 'Movies', viewers: '4.6K' },
];

export const LiveChannelsTemplate: FC = () => {
  const [watching, setWatching] = useState<Record<string, boolean>>({});

  const toggleWatch = (id: string) => {
    setWatching((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Live TV</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Channels broadcasting now.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {CHANNELS.length} channels live
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CHANNELS.map((item) => (
            <div
              key={item.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <FiRadio className="text-error shrink-0" />
                    <div>
                      <p className="truncate text-sm font-medium">
                        {item.name}
                      </p>
                      <p className="text-base-content/50 text-xs">
                        {item.category}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-error badge-sm">Live</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiUsers />
                    {item.viewers} watching
                  </p>
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

LiveChannelsTemplate.displayName = 'LiveChannelsTemplate';
