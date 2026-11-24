'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';

interface FavoriteTeam {
  id: string;
  name: string;
  league: string;
  record: string;
}

const TEAMS: FavoriteTeam[] = [
  {
    id: 't1',
    name: 'FC Riverside',
    league: 'Premier Division',
    record: '12W 4L 2D',
  },
  {
    id: 't2',
    name: 'Atlas United',
    league: 'Premier Division',
    record: '10W 5L 3D',
  },
  {
    id: 't3',
    name: 'Granite FC',
    league: 'Second Division',
    record: '9W 6L 3D',
  },
  {
    id: 't4',
    name: 'Northport City',
    league: 'Champions Cup',
    record: '11W 4L 3D',
  },
];

export const FavoriteTeamsTemplate: FC = () => {
  const [teams, setTeams] = useState<FavoriteTeam[]>(TEAMS);

  const removeTeam = (id: string) => {
    setTeams((prev) => prev.filter((team) => team.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Favorite Teams</h1>
        <p className="text-base-content/50 mt-1 text-sm">Teams you follow.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {teams.length} favorite teams
        </p>
        {teams.length === 0 ? (
          <p className="text-base-content/50 text-sm">No favorite teams</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body flex-row items-center justify-between gap-3 p-5">
                  <div className="flex min-w-0 items-center gap-2">
                    <FiHeart className="text-error shrink-0" />
                    <div>
                      <p className="truncate text-sm font-medium">
                        {team.name}
                      </p>
                      <p className="text-base-content/50 text-xs">
                        {team.league}
                      </p>
                      <p className="text-base-content/50 text-xs">
                        {team.record}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeTeam(team.id)}
                    aria-label={`Remove ${team.name}`}
                    className="btn btn-ghost btn-xs">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

FavoriteTeamsTemplate.displayName = 'FavoriteTeamsTemplate';
