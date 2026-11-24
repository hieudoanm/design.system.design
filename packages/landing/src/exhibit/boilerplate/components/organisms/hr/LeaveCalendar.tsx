'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface Leave {
  date: string;
  name: string;
  type: 'annual' | 'sick' | 'personal' | 'maternity';
}

interface LeaveCalendarProps {
  leaves: Leave[];
}

const typeClass: Record<Leave['type'], string> = {
  annual: 'badge-success',
  sick: 'badge-warning',
  personal: 'badge-info',
  maternity: 'badge-secondary',
};

const weekdayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const LeaveCalendar: FC<LeaveCalendarProps> = ({ leaves }) => {
  const initial = leaves[0]?.date ?? new Date().toISOString().slice(0, 10);
  const initialDate = new Date(`${initial}T00:00:00`);
  const [month, setMonth] = useState(
    () => new Date(initialDate.getFullYear(), initialDate.getMonth(), 1)
  );
  const [selected, setSelected] = useState<string | null>(null);

  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const monthLabel = month.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const cells = Array.from(
    { length: firstWeekday + daysInMonth },
    (_, i) => i - firstWeekday + 1
  );

  const toKey = (day: number): string =>
    `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  const prevMonth = (): void =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const nextMonth = (): void =>
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const selectedLeaves = selected
    ? leaves.filter((leave) => leave.date === selected)
    : [];

  return (
    <div
      className="card bg-base-200 border-base-content/10 w-full border"
      data-testid="leave-calendar">
      <div className="card-body">
        <div className="flex items-center justify-between">
          <h3 className="card-title">{monthLabel}</h3>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous month"
              onClick={prevMonth}
              className="btn btn-ghost btn-sm">
              ‹
            </button>
            <button
              type="button"
              aria-label="Next month"
              onClick={nextMonth}
              className="btn btn-ghost btn-sm">
              ›
            </button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {weekdayLabels.map((label) => (
            <span
              key={label}
              className="text-base-content/50 text-center text-xs font-medium">
              {label}
            </span>
          ))}
          {cells.map((day, index) => {
            if (day <= 0) {
              return <span key={`blank-${index}`} />;
            }
            const key = toKey(day);
            const dayLeaves = leaves.filter((leave) => leave.date === key);
            const isSelected = selected === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSelected(isSelected ? null : key)}
                className={`flex h-16 flex-col items-center justify-start gap-1 rounded-lg p-1 text-sm ${
                  dayLeaves.length > 0
                    ? 'bg-primary/10 hover:bg-primary/20'
                    : 'hover:bg-base-300'
                } ${isSelected ? 'ring-primary ring-2' : ''}`}>
                <span>{day}</span>
                {dayLeaves.slice(0, 2).map((leave) => (
                  <span
                    key={leave.name}
                    className={`badge badge-sm ${typeClass[leave.type]}`}>
                    {leave.name}
                  </span>
                ))}
              </button>
            );
          })}
        </div>
        <div className="min-h-12">
          {selected === null && (
            <p className="text-base-content/40 text-sm">
              Select a day to see who is on leave.
            </p>
          )}
          {selected !== null && selectedLeaves.length === 0 && (
            <p className="text-base-content/40 text-sm">
              No leave scheduled for {selected}.
            </p>
          )}
          {selectedLeaves.length > 0 && (
            <ul className="flex flex-col gap-1">
              {selectedLeaves.map((leave) => (
                <li
                  key={leave.name}
                  className="flex items-center gap-2 text-sm">
                  <span className={`badge badge-sm ${typeClass[leave.type]}`}>
                    {leave.type}
                  </span>
                  {leave.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

LeaveCalendar.displayName = 'LeaveCalendar';
