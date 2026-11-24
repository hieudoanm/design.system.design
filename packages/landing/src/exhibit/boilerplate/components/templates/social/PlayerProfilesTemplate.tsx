'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMapPin, FiSearch, FiUsers } from 'react-icons/fi';

interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  rank: string;
  hours: string;
}

const PLAYERS: Player[] = [
  {
    id: 'p1',
    name: 'NovaBlaze',
    team: 'Team Alpha',
    role: 'DPS',
    rank: 'Gold III',
    hours: '1,240',
  },
  {
    id: 'p2',
    name: 'ShadowFang',
    team: 'Team Vortex',
    role: 'Support',
    rank: 'Platinum II',
    hours: '980',
  },
  {
    id: 'p3',
    name: 'PixelPulse',
    team: 'Team Raptor',
    role: 'Tank',
    rank: 'Diamond I',
    hours: '2,105',
  },
  {
    id: 'p4',
    name: 'VoidWalker',
    team: 'Team Phoenix',
    role: 'Sniper',
    rank: 'Silver I',
    hours: '430',
  },
  {
    id: 'p5',
    name: 'IronStrike',
    team: 'Team Ghost',
    role: 'Support',
    rank: 'Gold II',
    hours: '1,560',
  },
];

export const PlayerProfilesTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const filtered = PLAYERS.filter((player) =>
    player.name.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Players</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Follow your favorites.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:w-72">
            <FiSearch className="text-base-content/50 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              aria-label="Search players"
              placeholder="Search players..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="input input-bordered input-sm w-full pl-9"
            />
          </div>
          <p className="text-base-content/50 text-sm">
            {filtered.length} players
          </p>
        </div>

        {filtered.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No players found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {filtered.map((player) => (
              <div
                key={player.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      <FiUsers />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{player.name}</p>
                      <p className="text-base-content/50 flex items-center gap-1 text-xs">
                        <FiMapPin />
                        {player.team}
                      </p>
                    </div>
                    <span className="badge badge-ghost badge-sm">
                      {player.rank}
                    </span>
                  </div>
                  <div className="text-base-content/50 flex items-center gap-3 text-xs">
                    <span>{player.role}</span>
                    <span>{player.hours} hours</span>
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

PlayerProfilesTemplate.displayName = 'PlayerProfilesTemplate';
