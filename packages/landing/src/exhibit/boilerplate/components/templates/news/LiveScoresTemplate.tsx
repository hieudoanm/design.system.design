'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiActivity, FiClock } from 'react-icons/fi';

type Sport = 'Football' | 'Basketball';
type SportFilter = 'All' | Sport;

interface Match {
  id: string;
  home: string;
  away: string;
  score: string;
  sport: Sport;
}

const MATCHES: Match[] = [
  {
    id: 'm1',
    home: 'FC Riverside',
    away: 'Atlas United',
    score: '2 — 1',
    sport: 'Football',
  },
  {
    id: 'm2',
    home: 'Northport City',
    away: 'Granite FC',
    score: '1 — 1',
    sport: 'Football',
  },
  {
    id: 'm3',
    home: 'Lakeside Nets',
    away: 'Harbor Hoops',
    score: '88 — 84',
    sport: 'Basketball',
  },
  {
    id: 'm4',
    home: 'Summit Storm',
    away: 'Copper Bears',
    score: '101 — 97',
    sport: 'Basketball',
  },
];

const FILTERS: SportFilter[] = ['All', 'Football', 'Basketball'];

const sportBadgeClass = (sport: Sport) =>
  sport === 'Football' ? 'badge-neutral' : 'badge-warning';

export const LiveScoresTemplate: FC = () => {
  const [filter, setFilter] = useState<SportFilter>('All');

  const visible = MATCHES.filter(
    (match) => filter === 'All' || match.sport === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Live Scores</h1>
        <p className="text-base-content/50 mt-1 text-sm">Scores from today.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <p className="text-base-content/50 flex items-center gap-1 text-sm">
            <FiActivity className="h-3.5 w-3.5" />
            {visible.length} matches live
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {visible.map((match) => (
            <div
              key={match.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`badge ${sportBadgeClass(match.sport)} badge-sm`}>
                    {match.sport}
                  </span>
                  <span className="badge badge-error badge-sm gap-1">
                    <FiClock className="h-3 w-3" />
                    Live
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{match.home}</p>
                  <p className="text-base-content/50 text-sm">{match.score}</p>
                  <p className="text-right text-sm font-medium">{match.away}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

LiveScoresTemplate.displayName = 'LiveScoresTemplate';
