import type { FC } from 'react';

interface WorkHoursProps {
  start: string;
  end: string;
  timezone?: string;
}

export const WorkHours: FC<WorkHoursProps> = ({ start, end, timezone }) => (
  <span data-testid="work-hours" className="text-base-content/70 text-sm">
    <span aria-hidden="true" className="mr-1">
      🕐
    </span>
    {start} – {end}
    {timezone && <span className="text-base-content/50"> ({timezone})</span>}
  </span>
);
