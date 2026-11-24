'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiMapPin, FiStar } from 'react-icons/fi';

type EventType = 'Goal' | 'Card';

interface MatchEvent {
  id: string;
  minute: number;
  type: EventType;
  team: string;
  player: string;
}

const HOME = 'FC Riverside';
const AWAY = 'Atlas United';
const SCORE = '2 — 1';
const VENUE = 'Riverside Arena';
const DATE = 'Aug 7, 2026';

const EVENTS: MatchEvent[] = [
  { id: 'e1', minute: 12, type: 'Goal', team: HOME, player: 'Mateo Silva' },
  { id: 'e2', minute: 34, type: 'Goal', team: AWAY, player: 'Jordan Reyes' },
  { id: 'e3', minute: 58, type: 'Card', team: AWAY, player: 'Theo Marsh' },
  { id: 'e4', minute: 72, type: 'Goal', team: HOME, player: 'Diego Ramos' },
];

const eventBadgeClass = (type: EventType) =>
  type === 'Goal' ? 'badge-success' : 'badge-error';

export const MatchDetailTemplate: FC = () => {
  const [following, setFollowing] = useState(false);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Match</h1>
        <p className="text-base-content/50 mt-1 text-sm">Match details.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-4 p-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-base font-semibold">{HOME}</p>
              <p className="text-2xl font-bold">{SCORE}</p>
              <p className="text-right text-base font-semibold">{AWAY}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-base-content/50 flex items-center gap-1 text-xs">
                <FiCalendar className="h-3.5 w-3.5" />
                {DATE}
              </span>
              <span className="text-base-content/50 flex items-center gap-1 text-xs">
                <FiMapPin className="h-3.5 w-3.5" />
                {VENUE}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setFollowing((prev) => !prev)}
                className="btn btn-primary btn-sm gap-1">
                <FiStar />
                {following ? 'Following' : 'Follow match'}
              </button>
              {following && (
                <span className="badge badge-success badge-sm">Following</span>
              )}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-4 border">
          <div className="card-body gap-4 p-6">
            <p className="text-sm font-semibold">Key moments</p>
            <div className="flex flex-col gap-3">
              {EVENTS.map((event) => (
                <div key={event.id} className="flex items-center gap-3">
                  <p className="text-base-content/50 w-8 text-xs">
                    {event.minute}&apos;
                  </p>
                  <span
                    className={`badge ${eventBadgeClass(event.type)} badge-sm`}>
                    {event.type}
                  </span>
                  <div className="flex min-w-0 flex-col">
                    <p className="truncate text-sm font-medium">
                      {event.player}
                    </p>
                    <p className="text-base-content/50 text-xs">{event.team}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

MatchDetailTemplate.displayName = 'MatchDetailTemplate';
