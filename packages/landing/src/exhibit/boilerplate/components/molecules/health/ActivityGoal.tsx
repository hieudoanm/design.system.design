import type { FC } from 'react';

interface ActivityGoalProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  completed?: boolean;
  onAdd?: (delta: number) => void;
}

export const ActivityGoal: FC<ActivityGoalProps> = ({
  label,
  current,
  target,
  unit,
  completed = false,
  onAdd,
}) => {
  const pct =
    target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="activity-goal">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{label}</h3>
          {completed && <span className="badge badge-success">Completed</span>}
        </div>
        <p className="text-3xl font-bold" data-testid="goal-current">
          {current}
          {unit && (
            <span className="text-base-content/50 text-base">{unit}</span>
          )}
        </p>
        <progress
          className="progress progress-primary h-3 w-full"
          value={pct}
          max={100}
        />
        <div className="flex items-center justify-between text-sm">
          <span className="text-base-content/50">
            Goal {target}
            {unit}
          </span>
          {onAdd && (
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => onAdd(1)}>
              + Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
