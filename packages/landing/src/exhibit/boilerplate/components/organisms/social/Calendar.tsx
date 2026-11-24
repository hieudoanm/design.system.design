'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { FC } from 'react';

interface CalendarProps {
  value?: Date;
  onChange?: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

const isSameMonth = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildCells = (month: Date): Date[] => {
  const first = startOfMonth(month);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    cells.push(cell);
  }
  return cells;
};

export const Calendar: FC<CalendarProps> = ({
  value,
  onChange,
  minDate,
  maxDate,
  className = '',
}) => {
  const [viewMonth, setViewMonth] = useState(startOfMonth(value ?? new Date()));
  const cells = buildCells(viewMonth);
  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const prevDisabled = minDate ? startOfMonth(minDate) >= viewMonth : false;
  const nextDisabled = maxDate ? startOfMonth(maxDate) <= viewMonth : false;

  return (
    <div
      className={`card bg-base-200 border-base-content/10 border ${className}`}>
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Previous month"
            disabled={prevDisabled}
            onClick={() => setViewMonth(addMonths(viewMonth, -1))}
            className="btn btn-ghost btn-sm">
            <FiChevronLeft aria-hidden="true" />
          </button>
          <div aria-live="polite" className="text-sm font-medium">
            {monthLabel}
          </div>
          <button
            type="button"
            aria-label="Next month"
            disabled={nextDisabled}
            onClick={() => setViewMonth(addMonths(viewMonth, 1))}
            className="btn btn-ghost btn-sm">
            <FiChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-base-content/50 py-1 text-xs">
              {day}
            </div>
          ))}
          {cells.map((date) => {
            const out = !isSameMonth(date, viewMonth);
            const selected = value ? sameDay(date, value) : false;
            const disabled = isDisabled(date);
            return (
              <button
                key={date.toISOString()}
                type="button"
                aria-label={date.toDateString()}
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onChange?.(date)}
                className={`btn btn-ghost btn-xs ${
                  out ? 'text-base-content/30' : ''
                } ${selected ? 'btn-primary' : ''} ${
                  disabled ? 'btn-disabled' : ''
                }`}>
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
