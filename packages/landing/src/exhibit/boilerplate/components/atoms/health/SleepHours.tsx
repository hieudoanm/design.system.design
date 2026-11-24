import type { FC } from 'react';

interface SleepHoursProps {
  hours: number;
  goal?: number;
  className?: string;
}

export const SleepHours: FC<SleepHoursProps> = ({
  hours,
  goal = 8,
  className = '',
}) => (
  <div data-testid="sleep-hours" className={className}>
    <p className="text-2xl font-semibold">
      {hours.toFixed(1)}
      <span className="text-base-content/60 ml-1 text-sm">h</span>
    </p>
    <p className="text-base-content/60 text-sm">Goal {goal.toFixed(0)}h</p>
  </div>
);
