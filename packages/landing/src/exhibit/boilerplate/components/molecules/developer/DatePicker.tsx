'use client';

import { useState } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { FC } from 'react';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  label?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
}

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const startOfMonth = (date: Date): Date =>
  new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, delta: number): Date =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const buildCells = (month: Date): Date[] => {
  const start = new Date(startOfMonth(month));
  start.setDate(start.getDate() - start.getDay());
  const cells: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    const cell = new Date(start);
    cell.setDate(start.getDate() + i);
    cells.push(cell);
  }
  return cells;
};

export const DatePicker: FC<DatePickerProps> = ({
  value,
  onChange,
  label = 'Pick a date',
  placeholder = 'Select date',
  minDate,
  maxDate,
}) => {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState(startOfMonth(value ?? new Date()));
  const cells = buildCells(viewMonth);
  const monthLabel = viewMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const formatValue = (): string =>
    value
      ? value.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : placeholder;

  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    return false;
  };

  const select = (date: Date): void => {
    onChange(date);
    setOpen(false);
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <span className="text-sm font-medium">{label}</span>
      <div className="relative">
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="input input-bordered flex w-full items-center justify-between gap-2 text-sm">
          <span className={value ? '' : 'text-base-content/50'}>
            {formatValue()}
          </span>
          <FiCalendar
            className="text-base-content/50 shrink-0"
            aria-hidden="true"
          />
        </button>
        {open && (
          <div
            role="dialog"
            aria-label={label}
            className="bg-base-100 border-base-content/10 absolute z-20 mt-2 w-64 rounded-2xl border p-3 shadow-2xl">
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => setViewMonth(addMonths(viewMonth, -1))}
                className="btn btn-ghost btn-xs">
                <FiChevronLeft aria-hidden="true" />
              </button>
              <span className="text-sm font-medium" aria-live="polite">
                {monthLabel}
              </span>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => setViewMonth(addMonths(viewMonth, 1))}
                className="btn btn-ghost btn-xs">
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
                const out = date.getMonth() !== viewMonth.getMonth();
                const selected = value ? sameDay(date, value) : false;
                const disabled = isDisabled(date);
                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    aria-label={date.toDateString()}
                    aria-pressed={selected}
                    disabled={disabled}
                    onClick={() => select(date)}
                    className={`btn btn-ghost btn-xs ${
                      out ? 'text-base-content/30' : ''
                    } ${selected ? 'btn-primary' : ''}`}>
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
