'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  stepMinutes?: number;
  format?: '12h' | '24h';
}

const pad = (n: number): string => String(n).padStart(2, '0');

export const TimePicker: FC<TimePickerProps> = ({
  value,
  onChange,
  label,
  stepMinutes = 30,
  format = '24h',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const options: string[] = [];
  const step = Math.max(1, Math.min(60, stepMinutes));
  for (let hour = 0; hour < 24; hour += 1) {
    for (let minute = 0; minute < 60; minute += step) {
      options.push(`${pad(hour)}:${pad(minute)}`);
    }
  }

  const display = (time: string): string => {
    if (format === '24h') return time;
    const [hour, minute] = time.split(':').map(Number);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${pad(displayHour)}:${pad(minute)} ${period}`;
  };

  return (
    <div ref={ref} className="flex w-full flex-col gap-1">
      {label && <span className="label-text">{label}</span>}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="border-base-content/10 bg-base-100 min-h-11 w-full rounded-xl border px-3 py-2 text-left text-sm">
          {display(value)}
        </button>
        {open && (
          <div
            role="listbox"
            className="border-base-content/10 bg-base-100 absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border p-1 shadow-lg">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`hover:bg-base-200 block w-full rounded-lg px-3 py-1.5 text-left text-sm ${
                  option === value ? 'bg-base-200 font-medium' : ''
                }`}>
                {display(option)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

TimePicker.displayName = 'TimePicker';
