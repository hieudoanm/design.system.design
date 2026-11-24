'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward, FiCalendar, FiZap } from 'react-icons/fi';

type Status = 'Registering' | 'Live' | 'Finished';

interface Tournament {
  id: string;
  name: string;
  game: string;
  prize: string;
  date: string;
  status: Status;
}

const TOURNAMENTS: Tournament[] = [
  {
    id: 't1',
    name: 'Aurora Cup',
    game: 'Stellar Vanguard',
    prize: '$10,000',
    date: 'Aug 15, 2026',
    status: 'Registering',
  },
  {
    id: 't2',
    name: 'Iron Forge Invitational',
    game: 'Ironforge Realms',
    prize: '$25,000',
    date: 'Aug 20, 2026',
    status: 'Registering',
  },
  {
    id: 't3',
    name: 'Phantom Ops Showdown',
    game: 'Phantom Ops',
    prize: '$5,000',
    date: 'Aug 9, 2026',
    status: 'Live',
  },
  {
    id: 't4',
    name: 'Kingdom Clash Series',
    game: 'Kingdom Tactics',
    prize: '$15,000',
    date: 'Jul 30, 2026',
    status: 'Finished',
  },
  {
    id: 't5',
    name: 'Neon City Rumble',
    game: 'Nova Online',
    prize: '$8,000',
    date: 'Aug 22, 2026',
    status: 'Registering',
  },
];

const statusBadgeClass = (status: Status) => {
  switch (status) {
    case 'Registering':
      return 'badge-info';
    case 'Live':
      return 'badge-error';
    default:
      return 'badge-neutral';
  }
};

export const TournamentsTemplate: FC = () => {
  const [registered, setRegistered] = useState<Record<string, boolean>>({});

  const toggleRegister = (id: string) => {
    setRegistered((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Tournaments</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Upcoming and live events.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {TOURNAMENTS.length} tournaments
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TOURNAMENTS.map((tournament) => (
            <div
              key={tournament.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{tournament.name}</p>
                    <p className="text-base-content/50 text-xs">
                      {tournament.game}
                    </p>
                  </div>
                  <span
                    className={`badge ${statusBadgeClass(tournament.status)} badge-sm`}>
                    {tournament.status}
                  </span>
                </div>
                <div className="text-base-content/50 flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <FiAward />
                    {tournament.prize} prize
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar />
                    {tournament.date}
                  </span>
                </div>
                {tournament.status === 'Registering' && (
                  <div className="flex items-center justify-between gap-3">
                    {registered[tournament.id] && (
                      <span className="badge badge-success badge-sm">
                        Registered
                      </span>
                    )}
                    <button
                      onClick={() => toggleRegister(tournament.id)}
                      className="btn btn-outline btn-sm gap-1">
                      <FiZap />
                      {registered[tournament.id] ? 'Registered' : 'Register'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

TournamentsTemplate.displayName = 'TournamentsTemplate';
