import type { FC } from 'react';

interface CalorieTrackerProps {
  consumed: number;
  burned: number;
  goal: number;
}

export const CalorieTracker: FC<CalorieTrackerProps> = ({
  consumed,
  burned,
  goal,
}) => {
  const net = consumed - burned;
  const remaining = goal - net;
  const pct = goal > 0 ? Math.min(100, Math.round((net / goal) * 100)) : 0;
  const overGoal = remaining < 0;
  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="calorie-tracker">
      <div className="card-body gap-3">
        <h3 className="card-title text-base">Calories</h3>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-base-200 rounded-xl p-3">
            <p className="text-base-content/50 text-xs">Consumed</p>
            <p className="text-lg font-semibold" data-testid="calorie-consumed">
              {consumed.toLocaleString()}
            </p>
          </div>
          <div className="bg-base-200 rounded-xl p-3">
            <p className="text-base-content/50 text-xs">Burned</p>
            <p className="text-lg font-semibold" data-testid="calorie-burned">
              {burned.toLocaleString()}
            </p>
          </div>
          <div className="bg-base-200 rounded-xl p-3">
            <p className="text-base-content/50 text-xs">Goal</p>
            <p className="text-lg font-semibold">{goal.toLocaleString()}</p>
          </div>
        </div>
        <progress
          className={`progress ${
            overGoal ? 'progress-error' : 'progress-primary'
          } h-3 w-full`}
          value={Math.abs(pct)}
          max={100}
        />
        <p className="text-sm" data-testid="calorie-remaining">
          {overGoal
            ? `${Math.abs(remaining).toLocaleString()} kcal over goal`
            : `${remaining.toLocaleString()} kcal remaining`}
        </p>
      </div>
    </div>
  );
};
