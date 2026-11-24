import type { FC } from 'react';

interface TimeZoneProps {
  timezone: string;
  city?: string;
}

export const TimeZone: FC<TimeZoneProps> = ({ timezone, city }) => (
  <span
    className="text-base-content/70 inline-flex items-center gap-1 text-sm"
    data-testid="time-zone">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
    {city ? `${city} · ` : ''}
    {timezone}
  </span>
);
