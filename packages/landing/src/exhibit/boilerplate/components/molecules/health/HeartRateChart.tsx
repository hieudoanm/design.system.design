import type { FC } from 'react';

interface HeartRatePoint {
  label: string;
  bpm: number;
}

interface HeartRateChartProps {
  points: HeartRatePoint[];
  title?: string;
}

const WIDTH = 300;
const HEIGHT = 100;
const PAD = 8;

export const HeartRateChart: FC<HeartRateChartProps> = ({
  points,
  title = 'Heart rate',
}) => {
  const showChart = points.length >= 2;
  const values = points.map((point) => point.bpm);
  const max = values.length > 0 ? Math.max(...values) : 0;
  const min = values.length > 0 ? Math.min(...values) : 0;
  const range = Math.max(max - min, 1);
  const coords = points.map((point, index) => {
    const x =
      points.length > 1
        ? (index / (points.length - 1)) * (WIDTH - PAD * 2) + PAD
        : WIDTH / 2;
    const y = HEIGHT - PAD - ((point.bpm - min) / range) * (HEIGHT - PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="heart-rate-chart">
      <div className="card-body gap-3">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">{title}</h3>
          <span className="badge badge-error">
            ❤ {showChart ? `${min}–${max} bpm` : '—'}
          </span>
        </div>
        {showChart ? (
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="text-error h-28 w-full"
            role="img"
            aria-label={title}
            data-testid="heart-rate-svg">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              points={coords.join(' ')}
            />
          </svg>
        ) : (
          <p className="text-base-content/50 text-sm">Not enough data</p>
        )}
      </div>
    </div>
  );
};
