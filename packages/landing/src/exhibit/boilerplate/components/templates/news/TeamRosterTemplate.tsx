'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';

type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';
type PositionFilter = 'All' | 'Defenders' | 'Midfielders' | 'Forwards';

interface Player {
  id: string;
  number: number;
  name: string;
  position: Position;
  country: string;
}

const PLAYERS: Player[] = [
  {
    id: 'p1',
    number: 1,
    name: 'Rafael Cruz',
    position: 'Goalkeeper',
    country: 'Brazil',
  },
  {
    id: 'p2',
    number: 4,
    name: 'Omar Haddad',
    position: 'Defender',
    country: 'Morocco',
  },
  {
    id: 'p3',
    number: 5,
    name: 'Kenji Tanaka',
    position: 'Defender',
    country: 'Japan',
  },
  {
    id: 'p4',
    number: 6,
    name: 'Lukas Meyer',
    position: 'Midfielder',
    country: 'Germany',
  },
  {
    id: 'p5',
    number: 8,
    name: 'Ivan Petrov',
    position: 'Midfielder',
    country: 'Ukraine',
  },
  {
    id: 'p6',
    number: 9,
    name: 'Mateo Silva',
    position: 'Forward',
    country: 'Argentina',
  },
  {
    id: 'p7',
    number: 10,
    name: 'Diego Ramos',
    position: 'Forward',
    country: 'Spain',
  },
  {
    id: 'p8',
    number: 11,
    name: 'Elias Fournier',
    position: 'Forward',
    country: 'France',
  },
];

const FILTERS: PositionFilter[] = [
  'All',
  'Defenders',
  'Midfielders',
  'Forwards',
];

const positionForFilter = (filter: PositionFilter): Position | null => {
  if (filter === 'Defenders') return 'Defender';
  if (filter === 'Midfielders') return 'Midfielder';
  if (filter === 'Forwards') return 'Forward';
  return null;
};

export const TeamRosterTemplate: FC = () => {
  const [filter, setFilter] = useState<PositionFilter>('All');

  const visible = PLAYERS.filter((player) => {
    const position = positionForFilter(filter);
    return position === null || player.position === position;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Team Roster</h1>
        <p className="text-base-content/50 mt-1 text-sm">Meet the squad.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">FC Riverside</p>
            <p className="text-base-content/50 text-sm">
              {visible.length} players
            </p>
          </div>
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-0 p-2">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Player</th>
                    <th>Position</th>
                    <th>Country</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((player) => (
                    <tr key={player.id}>
                      <td className="text-base-content/50">{player.number}</td>
                      <td className="font-medium">{player.name}</td>
                      <td>{player.position}</td>
                      <td className="text-base-content/50">{player.country}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TeamRosterTemplate.displayName = 'TeamRosterTemplate';
