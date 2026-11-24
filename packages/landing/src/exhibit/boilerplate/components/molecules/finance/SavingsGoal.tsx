import type { FC } from 'react';

interface SavingsGoalProps {
  name: string;
  current: number;
  target: number;
  currency?: string;
  deadline?: string;
}

export const SavingsGoal: FC<SavingsGoalProps> = ({
  name,
  current,
  target,
  currency = '$',
  deadline,
}) => {
  const pct =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const completed = pct >= 100;
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="savings-goal">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{name}</h3>
          <span
            className={`badge ${completed ? 'badge-success' : 'badge-primary'}`}>
            {completed ? 'Completed' : `${pct}%`}
          </span>
        </div>
        <progress
          className="progress progress-primary h-3 w-full"
          value={pct}
          max={100}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium" data-testid="savings-current">
            {currency}
            {current.toLocaleString()}
          </span>
          <span className="text-base-content/50">
            of {currency}
            {target.toLocaleString()}
          </span>
        </div>
        {deadline && (
          <p className="text-base-content/60 text-xs">Goal by {deadline}</p>
        )}
      </div>
    </div>
  );
};
