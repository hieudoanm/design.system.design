'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const TODAY = new Date();

const EVENTS: Record<string, string[]> = {
  '5': ['Team standup', 'Design review'],
  '12': ['Client call'],
  '20': ['Release v2.0', 'Sprint planning'],
};

const getDaysInMonth = (year: number, month: number): number =>
  new Date(year, month + 1, 0).getDate();

const getFirstWeekday = (year: number, month: number): number =>
  new Date(year, month, 1).getDay();

const getDayClass = (isSelected: boolean, isToday: boolean): string => {
  if (isSelected) return 'bg-primary text-primary-content';
  if (isToday) return 'bg-base-300 font-semibold';
  return 'hover:bg-base-300/60';
};

export const CalendarTemplate: FC = () => {
  const [year, setYear] = useState(TODAY.getFullYear());
  const [month, setMonth] = useState(TODAY.getMonth());
  const [selected, setSelected] = useState(TODAY.getDate());

  const daysInMonth = getDaysInMonth(year, month);
  const firstWeekday = getFirstWeekday(year, month);

  const shiftMonth = (delta: number) => {
    const date = new Date(year, month + delta, 1);
    const nextYear = date.getFullYear();
    const nextMonth = date.getMonth();
    setYear(nextYear);
    setMonth(nextMonth);
    setSelected((prev) => Math.min(prev, getDaysInMonth(nextYear, nextMonth)));
  };

  const dayEvents = EVENTS[String(selected)] ?? [];

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Plan events and keep track of your schedule.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold">
                {MONTHS[month]} {year}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={() => shiftMonth(-1)}
                  aria-label="Previous month"
                  className="btn btn-ghost btn-sm btn-square">
                  <FiChevronLeft />
                </button>
                <button
                  onClick={() => shiftMonth(1)}
                  aria-label="Next month"
                  className="btn btn-ghost btn-sm btn-square">
                  <FiChevronRight />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="text-base-content/40 text-center text-xs font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: firstWeekday }).map((_, idx) => (
                <div key={`blank-${idx}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, idx) => {
                const day = idx + 1;
                const isToday =
                  day === TODAY.getDate() &&
                  month === TODAY.getMonth() &&
                  year === TODAY.getFullYear();
                return (
                  <button
                    key={day}
                    onClick={() => setSelected(day)}
                    aria-label={`Select day ${day}`}
                    aria-pressed={selected === day}
                    className={`h-10 rounded-lg text-sm transition-colors ${getDayClass(
                      selected === day,
                      isToday
                    )}`}>
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mt-6 border">
          <div className="card-body p-5">
            <div className="mb-3 flex items-center gap-2">
              <FiCalendar className="text-base-content/50 h-4 w-4" />
              <h3 className="font-semibold">Events for day {selected}</h3>
            </div>
            {dayEvents.length === 0 ? (
              <p className="text-base-content/50 text-sm">No events</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {dayEvents.map((event) => (
                  <li
                    key={event}
                    className="bg-base-300/50 rounded-lg px-3 py-2 text-sm">
                    {event}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

CalendarTemplate.displayName = 'CalendarTemplate';
