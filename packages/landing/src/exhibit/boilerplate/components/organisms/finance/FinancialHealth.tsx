import type { CSSProperties, FC } from 'react';

interface RingStyle extends CSSProperties {
  '--value'?: number;
}

interface HealthMetric {
  label: string;
  value: string;
  status?: 'good' | 'warning' | 'bad';
}

interface FinancialHealthProps {
  score: number;
  metrics: HealthMetric[];
  title?: string;
}

const metricBadge: Record<NonNullable<HealthMetric['status']>, string> = {
  good: 'badge-success',
  warning: 'badge-warning',
  bad: 'badge-error',
};

const scoreColor = (score: number): string => {
  if (score >= 70) return 'text-success';
  if (score >= 40) return 'text-warning';
  return 'text-error';
};

const scoreMessage = (score: number): string => {
  if (score >= 70) return 'Strong financial position.';
  if (score >= 40) return 'Room for improvement.';
  return 'Financial action needed.';
};

export const FinancialHealth: FC<FinancialHealthProps> = ({
  score,
  metrics,
  title = 'Financial health',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="card-title">{title}</h3>
        <span className="badge badge-ghost">Overall</span>
      </div>
      <div className="flex items-center gap-4">
        <div
          className="radial-progress text-primary"
          style={{ '--value': score } as RingStyle}
          data-testid="score-ring">
          {score}
        </div>
        <ul className="flex flex-1 flex-col gap-2">
          {metrics.map((metric) => (
            <li
              key={metric.label}
              className="flex items-center justify-between gap-2">
              <span className="text-sm">{metric.label}</span>
              <span className="flex items-center gap-2">
                <span className="text-sm font-medium">{metric.value}</span>
                {metric.status && (
                  <span
                    className={`badge badge-sm ${metricBadge[metric.status]}`}>
                    {metric.status}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p
        className={`text-sm font-medium ${scoreColor(score)}`}
        data-testid="message">
        {scoreMessage(score)}
      </p>
    </div>
  </section>
);
