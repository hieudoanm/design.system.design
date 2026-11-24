import type { FC } from 'react';

interface StepsPoint {
  label: string;
  steps: number;
}

interface StepsChartProps {
  points: StepsPoint[];
  goal?: number;
}

const BAR_MAX = 80;

export const StepsChart: FC<StepsChartProps> = ({ points, goal }) => {
  const max = Math.max(...points.map((point) => point.steps), 1);
  const total = points.reduce((sum, point) => sum + point.steps, 0);
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="steps-chart">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">Steps</h3>
          <span className="text-sm font-semibold" data-testid="steps-total">
            {total.toLocaleString()}
          </span>
        </div>
        {goal !== undefined && (
          <p className="text-base-content/50 text-xs">
            Goal {goal.toLocaleString()} steps
          </p>
        )}
        {points.length === 0 ? (
          <p className="text-base-content/50 text-sm">No step data</p>
        ) : (
          <div
            className="flex items-end gap-2"
            style={{ height: 112 }}
            data-testid="steps-bars">
            {points.map((point) => (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  data-testid="steps-bar"
                  className="bg-success w-full rounded-t"
                  style={{
                    height: `${Math.round((point.steps / max) * BAR_MAX)}px`,
                  }}
                />
                <span className="text-base-content/50 text-[10px]">
                  {point.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
