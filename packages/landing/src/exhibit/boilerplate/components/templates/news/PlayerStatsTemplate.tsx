'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBarChart2 } from 'react-icons/fi';

type StatCategory = 'Goals' | 'Assists' | 'Clean sheets';

interface StatEntry {
  id: string;
  rank: number;
  player: string;
  team: string;
  category: StatCategory;
  value: number;
}

const STAT_LABELS: Record<StatCategory, string> = {
  Goals: 'goals',
  Assists: 'assists',
  'Clean sheets': 'clean sheets',
};

const STATS: StatEntry[] = [
  {
    id: 'g1',
    rank: 1,
    player: 'Mateo Silva',
    team: 'FC Riverside',
    category: 'Goals',
    value: 18,
  },
  {
    id: 'g2',
    rank: 2,
    player: 'Diego Ramos',
    team: 'FC Riverside',
    category: 'Goals',
    value: 14,
  },
  {
    id: 'g3',
    rank: 3,
    player: 'Kofi Mensah',
    team: 'Granite FC',
    category: 'Goals',
    value: 12,
  },
  {
    id: 'a1',
    rank: 1,
    player: 'Lukas Meyer',
    team: 'FC Riverside',
    category: 'Assists',
    value: 9,
  },
  {
    id: 'a2',
    rank: 2,
    player: 'Ivan Petrov',
    team: 'Northport City',
    category: 'Assists',
    value: 8,
  },
  {
    id: 'a3',
    rank: 3,
    player: 'Theo Marsh',
    team: 'Atlas United',
    category: 'Assists',
    value: 7,
  },
  {
    id: 'c1',
    rank: 1,
    player: 'Rafael Cruz',
    team: 'FC Riverside',
    category: 'Clean sheets',
    value: 11,
  },
  {
    id: 'c2',
    rank: 2,
    player: 'Noah Fischer',
    team: 'Atlas United',
    category: 'Clean sheets',
    value: 10,
  },
  {
    id: 'c3',
    rank: 3,
    player: 'Sven Keller',
    team: 'Lakeside FC',
    category: 'Clean sheets',
    value: 8,
  },
];

const TABS: StatCategory[] = ['Goals', 'Assists', 'Clean sheets'];

export const PlayerStatsTemplate: FC = () => {
  const [tab, setTab] = useState<StatCategory>('Goals');

  const visible = STATS.filter((entry) => entry.category === tab);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Player Stats</h1>
        <p className="text-base-content/50 mt-1 text-sm">Season statistics.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {TABS.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`tab ${tab === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 flex items-center gap-1 text-sm">
            <FiBarChart2 className="h-3.5 w-3.5" />
            {visible.length} players
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-0 p-2">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Player</th>
                    <th>Team</th>
                    <th>Stat</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((entry) => (
                    <tr key={entry.id}>
                      <td className="text-base-content/50">{entry.rank}</td>
                      <td className="font-medium">{entry.player}</td>
                      <td className="text-base-content/50">{entry.team}</td>
                      <td>
                        {entry.value} {STAT_LABELS[entry.category]}
                      </td>
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

PlayerStatsTemplate.displayName = 'PlayerStatsTemplate';
