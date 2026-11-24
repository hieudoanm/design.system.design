import type { FC } from 'react';

interface WeightPoint {
  label: string;
  weight: number;
}

interface WeightChartProps {
  points: WeightPoint[];
  unit?: string;
}

const BAR_MAX = 80;

export const WeightChart: FC<WeightChartProps> = ({ points, unit = 'kg' }) => {
  const values = points.map((point) => point.weight);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const span = Math.max(max - min, 1);
  const current = points.length > 0 ? points[points.length - 1].weight : 0;
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="weight-chart">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">Weight</h3>
          <span className="text-sm font-semibold" data-testid="weight-current">
            {current} {unit}
          </span>
        </div>
        {points.length === 0 ? (
          <p className="text-base-content/50 text-sm">No weight data</p>
        ) : (
          <div
            className="flex items-end gap-2"
            style={{ height: 112 }}
            data-testid="weight-bars">
            {points.map((point) => (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  data-testid="weight-bar"
                  className="bg-accent w-full rounded-t"
                  style={{
                    height: `${
                      Math.round(((point.weight - min) / span) * BAR_MAX) + 4
                    }px`,
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
