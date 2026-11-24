'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiClock } from 'react-icons/fi';

type ShiftDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri';
type ShiftSlot = 'Morning' | 'Afternoon' | 'Evening';
type DayFilter = 'All' | ShiftDay;

interface Shift {
  id: string;
  person: string;
  day: ShiftDay;
  time: string;
  slot: ShiftSlot;
}

const SHIFTS: Shift[] = [
  {
    id: 's1',
    person: 'Priya',
    day: 'Mon',
    time: '9:00-17:00',
    slot: 'Morning',
  },
  {
    id: 's2',
    person: 'Omar',
    day: 'Mon',
    time: '13:00-21:00',
    slot: 'Afternoon',
  },
  {
    id: 's3',
    person: 'Lena',
    day: 'Tue',
    time: '18:00-02:00',
    slot: 'Evening',
  },
  {
    id: 's4',
    person: 'David',
    day: 'Wed',
    time: '9:00-17:00',
    slot: 'Morning',
  },
  {
    id: 's5',
    person: 'Sofia',
    day: 'Thu',
    time: '13:00-21:00',
    slot: 'Afternoon',
  },
  { id: 's6', person: 'Maya', day: 'Fri', time: '9:00-17:00', slot: 'Morning' },
  {
    id: 's7',
    person: 'Tom',
    day: 'Fri',
    time: '18:00-02:00',
    slot: 'Evening',
  },
];

const FILTERS: DayFilter[] = ['All', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const getSlotBadge = (slot: ShiftSlot) => {
  switch (slot) {
    case 'Morning':
      return <span className="badge badge-success badge-sm">Morning</span>;
    case 'Afternoon':
      return <span className="badge badge-warning badge-sm">Afternoon</span>;
    default:
      return <span className="badge badge-neutral badge-sm">Evening</span>;
  }
};

export const ShiftScheduleTemplate: FC = () => {
  const [filter, setFilter] = useState<DayFilter>('All');

  const visible = SHIFTS.filter(
    (shift) => filter === 'All' || shift.day === filter
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Shift Schedule</h1>
        <p className="text-base-content/50 mt-1 text-sm">Upcoming shifts.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiClock />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Schedule</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} shifts this week
              </p>
            </div>
          </div>
        </div>

        <div className="tabs tabs-boxed tabs-sm mb-6 w-fit">
          {FILTERS.map((item) => (
            <button
              key={item}
              onClick={() => setFilter(item)}
              className={`tab ${filter === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Person</th>
                    <th className="px-4 py-3 font-medium">Day</th>
                    <th className="px-4 py-3 font-medium">Time</th>
                    <th className="px-4 py-3 font-medium">Slot</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((shift) => (
                    <tr
                      key={shift.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {shift.person}
                      </td>
                      <td className="px-4 py-3 text-sm">{shift.day}</td>
                      <td className="px-4 py-3 text-sm">{shift.time}</td>
                      <td className="px-4 py-3">{getSlotBadge(shift.slot)}</td>
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

ShiftScheduleTemplate.displayName = 'ShiftScheduleTemplate';
