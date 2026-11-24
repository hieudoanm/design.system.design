'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiBell, FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

interface Fixture {
  id: string;
  home: string;
  away: string;
  date: string;
  time: string;
  venue: string;
}

const FIXTURES: Fixture[] = [
  {
    id: 'f1',
    home: 'FC Riverside',
    away: 'Granite FC',
    date: 'Aug 10, 2026',
    time: '18:00',
    venue: 'Riverside Arena',
  },
  {
    id: 'f2',
    home: 'Atlas United',
    away: 'Northport City',
    date: 'Aug 11, 2026',
    time: '20:00',
    venue: 'Atlas Park',
  },
  {
    id: 'f3',
    home: 'Lakeside FC',
    away: 'Harbor City',
    date: 'Aug 12, 2026',
    time: '18:00',
    venue: 'Lakeside Ground',
  },
  {
    id: 'f4',
    home: 'Granite FC',
    away: 'Summit Storm',
    date: 'Aug 13, 2026',
    time: '19:30',
    venue: 'Granite Stadium',
  },
];

export const FixturesTemplate: FC = () => {
  const [reminders, setReminders] = useState<Record<string, boolean>>({});

  const toggleReminder = (id: string) => {
    setReminders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Fixtures</h1>
        <p className="text-base-content/50 mt-1 text-sm">Upcoming matches.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {FIXTURES.length} fixtures
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FIXTURES.map((fixture) => {
            const reminded = Boolean(reminders[fixture.id]);
            return (
              <div
                key={fixture.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body gap-3 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{fixture.home}</p>
                    <p className="text-base-content/50 text-xs">vs</p>
                    <p className="text-right text-sm font-medium">
                      {fixture.away}
                    </p>
                  </div>
                  <div className="text-base-content/50 flex flex-wrap items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <FiCalendar className="h-3 w-3" />
                      {fixture.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiClock className="h-3 w-3" />
                      {fixture.time}
                    </span>
                    <span className="flex items-center gap-1">
                      <FiMapPin className="h-3 w-3" />
                      {fixture.venue}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleReminder(fixture.id)}
                      className="btn btn-outline btn-sm gap-1">
                      <FiBell />
                      {reminded ? 'Reminder set' : 'Remind me'}
                    </button>
                    {reminded && (
                      <span className="badge badge-info badge-sm">
                        Reminder set
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

FixturesTemplate.displayName = 'FixturesTemplate';
