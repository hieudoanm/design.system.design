import type { FC } from 'react';

interface ActiveMinutesProps {
  minutes: number;
  goal?: number;
  className?: string;
}

export const ActiveMinutes: FC<ActiveMinutesProps> = ({
  minutes,
  goal = 30,
  className = '',
}) => (
  <div data-testid="active-minutes" className={className}>
    <p className="text-2xl font-semibold">
      {minutes}
      <span className="text-base-content/60 ml-1 text-sm">min</span>
    </p>
    <p className="text-base-content/60 text-sm">Active · goal {goal}min</p>
  </div>
);
