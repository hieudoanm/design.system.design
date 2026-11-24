'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiPause, FiPlay } from 'react-icons/fi';

interface Release {
  id: string;
  title: string;
  artist: string;
  genre: string;
  type: 'Album' | 'Single';
}

const RELEASES: Release[] = [
  {
    id: 'r1',
    title: 'Neon Tides',
    artist: 'Luna Vega',
    genre: 'Synthpop',
    type: 'Album',
  },
  {
    id: 'r2',
    title: 'Paper Planes',
    artist: 'The Afterglow',
    genre: 'Indie',
    type: 'Single',
  },
  {
    id: 'r3',
    title: 'Midnight Static',
    artist: 'Kaito Rei',
    genre: 'Electronic',
    type: 'Album',
  },
];

export const MusicHomeTemplate: FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);

  const togglePlay = (id: string) => {
    setPlayingId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Music</h1>
        <p className="text-base-content/50 mt-1 text-sm">Home feed.</p>
      </header>
      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {RELEASES.length} new releases
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {RELEASES.map((release) => (
            <div
              key={release.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium">{release.title}</p>
                    <p className="text-base-content/50 text-xs">
                      {release.artist}
                    </p>
                  </div>
                  {playingId === release.id && (
                    <span className="badge badge-info badge-sm">
                      Now playing
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="badge badge-ghost badge-sm">
                    {release.genre}
                  </span>
                  <span className="badge badge-neutral badge-sm">
                    {release.type}
                  </span>
                </div>
                <button
                  onClick={() => togglePlay(release.id)}
                  className="btn btn-primary btn-sm gap-1">
                  {playingId === release.id ? <FiPause /> : <FiPlay />}
                  {playingId === release.id ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

MusicHomeTemplate.displayName = 'MusicHomeTemplate';
