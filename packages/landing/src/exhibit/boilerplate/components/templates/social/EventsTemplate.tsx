'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiCheck, FiMapPin } from 'react-icons/fi';

type EventFilter = 'All' | 'Upcoming' | 'Past';

interface EventItem {
  id: string;
  title: string;
  date: string;
  location: string;
  attending: boolean;
  upcoming: boolean;
}

const EVENTS: EventItem[] = [
  {
    id: 'e1',
    title: 'TypeScript Meetup: Generics Deep Dive',
    date: 'Aug 12, 2026',
    location: 'Downtown Hub',
    attending: true,
    upcoming: true,
  },
  {
    id: 'e2',
    title: 'Design Systems Workshop',
    date: 'Aug 19, 2026',
    location: 'Online',
    attending: false,
    upcoming: true,
  },
  {
    id: 'e3',
    title: 'Rust Nation',
    date: 'Sep 02, 2026',
    location: 'Convention Center',
    attending: false,
    upcoming: true,
  },
  {
    id: 'e4',
    title: 'Hackathon: Accessibility Edition',
    date: 'Jul 10, 2026',
    location: 'Tech Campus',
    attending: false,
    upcoming: false,
  },
  {
    id: 'e5',
    title: 'Startup Founders Panel',
    date: 'Jun 28, 2026',
    location: 'Old Mill Theatre',
    attending: true,
    upcoming: false,
  },
];

const FILTERS: EventFilter[] = ['All', 'Upcoming', 'Past'];

export const EventsTemplate: FC = () => {
  const [events, setEvents] = useState<EventItem[]>(EVENTS);
  const [filter, setFilter] = useState<EventFilter>('All');

  const visible = events.filter(
    (event) =>
      filter === 'All' ||
      (filter === 'Upcoming' ? event.upcoming : !event.upcoming)
  );

  const toggleAttending = (id: string) => {
    setEvents((prev) =>
      prev.map((event) =>
        event.id === id ? { ...event, attending: !event.attending } : event
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Discover community events.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
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
          <p className="text-base-content/50 text-sm">
            {visible.length} events
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {visible.map((event) => (
            <div
              key={event.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body flex-row items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium">{event.title}</p>
                  <p className="text-base-content/50 mt-1 flex items-center gap-1 text-xs">
                    <FiCalendar />
                    {event.date}
                  </p>
                  <p className="text-base-content/50 mt-1 flex items-center gap-1 text-xs">
                    <FiMapPin />
                    {event.location}
                  </p>
                </div>
                {event.attending ? (
                  <span className="badge badge-success badge-sm gap-1">
                    <FiCheck />
                    Attending
                  </span>
                ) : (
                  <button
                    onClick={() => toggleAttending(event.id)}
                    className="btn btn-primary btn-sm">
                    RSVP
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

EventsTemplate.displayName = 'EventsTemplate';
