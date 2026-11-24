import type { FC } from 'react';

interface Metric {
  label: string;
  value: string;
  progress?: number;
  variant?: 'primary' | 'success' | 'warning' | 'error';
}

interface MetricBarProps {
  metrics: Metric[];
}

const PROGRESS_CLASS: Record<NonNullable<Metric['variant']>, string> = {
  primary: 'progress-primary',
  success: 'progress-success',
  warning: 'progress-warning',
  error: 'progress-error',
};

export const MetricBar: FC<MetricBarProps> = ({ metrics }) => (
  <div
    data-testid="metric-bar"
    className="bg-base-100 border-base-200 grid grid-cols-1 gap-4 rounded-2xl border p-4 sm:grid-cols-2 lg:grid-cols-4">
    {metrics.map((metric) => (
      <div key={metric.label} className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-base-content/50 text-sm">{metric.label}</span>
          <span className="text-lg font-semibold">{metric.value}</span>
        </div>
        {metric.progress !== undefined && (
          <progress
            className={`progress progress-sm ${PROGRESS_CLASS[metric.variant ?? 'primary']}`}
            value={metric.progress}
            max={100}
          />
        )}
      </div>
    ))}
  </div>
);
