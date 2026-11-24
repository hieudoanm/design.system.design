import type { FC } from 'react';

interface SleepPoint {
  label: string;
  hours: number;
}

interface SleepChartProps {
  points: SleepPoint[];
  title?: string;
}

const BAR_MAX = 80;

export const SleepChart: FC<SleepChartProps> = ({
  points,
  title = 'Sleep',
}) => {
  const max = Math.max(...points.map((point) => point.hours), 1);
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="sleep-chart">
      <div className="card-body gap-3">
        <h3 className="card-title text-base">{title}</h3>
        {points.length === 0 ? (
          <p className="text-base-content/50 text-sm">No sleep data</p>
        ) : (
          <div
            className="flex items-end gap-2"
            style={{ height: 112 }}
            data-testid="sleep-bars">
            {points.map((point) => (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-xs font-medium">{point.hours}h</span>
                <div
                  data-testid="sleep-bar"
                  className="bg-secondary w-full rounded-t"
                  style={{
                    height: `${Math.round((point.hours / max) * BAR_MAX)}px`,
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
