'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock, FiUsers, FiVideo } from 'react-icons/fi';

type DayFilter = 'Today' | 'This week' | 'All';

interface Meeting {
  id: string;
  title: string;
  time: string;
  day: 'Today' | 'This week';
  participants: number;
}

const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Product sync',
    time: '9:00 AM',
    day: 'Today',
    participants: 6,
  },
  {
    id: 'm2',
    title: 'Design review',
    time: '2:30 PM',
    day: 'Today',
    participants: 4,
  },
  {
    id: 'm3',
    title: 'Roadmap planning',
    time: '10:00 AM',
    day: 'This week',
    participants: 8,
  },
  {
    id: 'm4',
    title: 'Sprint retro',
    time: '3:00 PM',
    day: 'This week',
    participants: 5,
  },
  {
    id: 'm5',
    title: 'All-hands',
    time: '11:00 AM',
    day: 'This week',
    participants: 25,
  },
];

const FILTERS: DayFilter[] = ['Today', 'This week', 'All'];

export const MeetingsTemplate: FC = () => {
  const [filter, setFilter] = useState<DayFilter>('Today');

  const visible = INITIAL_MEETINGS.filter(
    (m) => filter === 'All' || m.day === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Meetings</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          See what is coming up and join on time.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="mb-6">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((meeting) => (
            <div
              key={meeting.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{meeting.title}</h3>
                  <span className="badge badge-ghost badge-sm">
                    {meeting.day}
                  </span>
                </div>
                <div className="mb-4 flex flex-col gap-1.5 text-sm">
                  <span className="text-base-content/50 flex items-center gap-2">
                    <FiClock className="h-4 w-4" />
                    {meeting.time}
                  </span>
                  <span className="text-base-content/50 flex items-center gap-2">
                    <FiUsers className="h-4 w-4" />
                    {meeting.participants} participants
                  </span>
                </div>
                <div className="flex justify-end">
                  <button className="btn btn-primary btn-sm">
                    <FiVideo />
                    Join
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

MeetingsTemplate.displayName = 'MeetingsTemplate';
