'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiAward, FiStar } from 'react-icons/fi';

type FormResult = 'W' | 'D' | 'L';

interface Standing {
  id: string;
  position: number;
  team: string;
  played: number;
  points: number;
  form: FormResult[];
}

const STANDINGS: Standing[] = [
  {
    id: 't1',
    position: 1,
    team: 'FC Riverside',
    played: 16,
    points: 38,
    form: ['W', 'W', 'D', 'W', 'W'],
  },
  {
    id: 't2',
    position: 2,
    team: 'Atlas United',
    played: 16,
    points: 34,
    form: ['W', 'D', 'W', 'W', 'L'],
  },
  {
    id: 't3',
    position: 3,
    team: 'Granite FC',
    played: 16,
    points: 30,
    form: ['D', 'W', 'L', 'W', 'D'],
  },
  {
    id: 't4',
    position: 4,
    team: 'Northport City',
    played: 16,
    points: 27,
    form: ['L', 'W', 'D', 'L', 'W'],
  },
  {
    id: 't5',
    position: 5,
    team: 'Lakeside FC',
    played: 16,
    points: 22,
    form: ['L', 'L', 'W', 'D', 'L'],
  },
  {
    id: 't6',
    position: 6,
    team: 'Harbor City',
    played: 16,
    points: 17,
    form: ['D', 'L', 'L', 'L', 'W'],
  },
];

const formBadgeClass = (result: FormResult) => {
  if (result === 'W') return 'badge-success';
  if (result === 'D') return 'badge-warning';
  return 'badge-error';
};

export const SeasonStandingsTemplate: FC = () => {
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Standings</h1>
        <p className="text-base-content/50 mt-1 text-sm">League table.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {STANDINGS.length} teams
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-0 p-2">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th>P</th>
                    <th>Pts</th>
                    <th>Form</th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {STANDINGS.map((standing) => {
                    const favorited = Boolean(favorites[standing.id]);
                    return (
                      <tr key={standing.id}>
                        <td className="text-base-content/50">
                          {standing.position}
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {standing.position === 1 && (
                              <span className="badge badge-success badge-sm gap-1">
                                <FiAward className="h-3 w-3" />
                                Leader
                              </span>
                            )}
                            <span className="font-medium">{standing.team}</span>
                          </div>
                        </td>
                        <td>{standing.played}</td>
                        <td>{standing.points} pts</td>
                        <td>
                          <div className="flex gap-1">
                            {standing.form.map((result, index) => (
                              <span
                                key={`${standing.id}-${index}`}
                                className={`badge ${formBadgeClass(result)} badge-sm`}>
                                {result}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleFavorite(standing.id)}
                              className="btn btn-ghost btn-xs gap-1">
                              <FiStar />
                              {favorited ? 'Favorited' : 'Favorite'}
                            </button>
                            {favorited && (
                              <span className="badge badge-warning badge-sm">
                                Favorited
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

SeasonStandingsTemplate.displayName = 'SeasonStandingsTemplate';
