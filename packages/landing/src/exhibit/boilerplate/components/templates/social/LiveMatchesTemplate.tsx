'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiTv, FiZap } from 'react-icons/fi';

interface LiveMatch {
  id: string;
  home: string;
  away: string;
  score: string;
  arena: string;
}

const MATCHES: LiveMatch[] = [
  {
    id: 'm1',
    home: 'Team Alpha',
    away: 'Team Nova',
    score: '3 — 1',
    arena: 'Crimson Arena',
  },
  {
    id: 'm2',
    home: 'Team Vortex',
    away: 'Team Raptor',
    score: '2 — 2',
    arena: 'Solar Stadium',
  },
  {
    id: 'm3',
    home: 'Team Phoenix',
    away: 'Team Apex',
    score: '1 — 0',
    arena: 'Iron Colosseum',
  },
  {
    id: 'm4',
    home: 'Team Ghost',
    away: 'Team Cyclone',
    score: '0 — 2',
    arena: 'Neon Field',
  },
];

export const LiveMatchesTemplate: FC = () => {
  const [watching, setWatching] = useState<Record<string, boolean>>({});

  const toggleWatch = (id: string) => {
    setWatching((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Live Matches</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Matches happening now.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {MATCHES.length} live matches
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {MATCHES.map((match) => (
            <div
              key={match.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="badge badge-error badge-sm gap-1">
                    <FiZap />
                    Live
                  </span>
                  <span className="text-base-content/50 flex items-center gap-1 text-xs">
                    <FiClock />
                    {match.arena}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{match.home}</p>
                  <span className="text-lg font-semibold">{match.score}</span>
                  <p className="text-sm font-medium">{match.away}</p>
                </div>
                <div className="flex items-center justify-between gap-3">
                  {watching[match.id] && (
                    <span className="badge badge-success badge-sm">
                      Watching
                    </span>
                  )}
                  <button
                    onClick={() => toggleWatch(match.id)}
                    className="btn btn-primary btn-sm gap-1">
                    <FiTv />
                    {watching[match.id] ? 'Watching' : 'Watch'}
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

LiveMatchesTemplate.displayName = 'LiveMatchesTemplate';
