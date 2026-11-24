import type { FC } from 'react';

interface StockPoint {
  label: string;
  value: number;
}

interface StockChartProps {
  points: StockPoint[];
  title?: string;
}

const BAR_MAX = 80;

export const StockChart: FC<StockChartProps> = ({
  points,
  title = 'Price',
}) => {
  const max = Math.max(...points.map((point) => point.value), 1);
  return (
    <div className="card bg-base-100 w-full shadow" data-testid="stock-chart">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{title}</h3>
          <span className="text-base-content/50 text-xs">Last 7 sessions</span>
        </div>
        {points.length === 0 ? (
          <p className="text-base-content/50 text-sm">No chart data</p>
        ) : (
          <div
            className="flex items-end gap-2"
            style={{ height: 112 }}
            data-testid="stock-chart-bars">
            {points.map((point) => (
              <div
                key={point.label}
                className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <div
                  data-testid="stock-chart-bar"
                  className="bg-primary w-full rounded-t"
                  style={{
                    height: `${Math.round((point.value / max) * BAR_MAX)}px`,
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
