import type { FC } from 'react';

interface Metric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  trend?: 'up' | 'down';
}

interface MetricsDashboardProps {
  metrics: Metric[];
  title?: string;
}

export const MetricsDashboard: FC<MetricsDashboardProps> = ({
  metrics,
  title = 'Metrics',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric) => (
        <article
          key={metric.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">{metric.label}</p>
            <p className="text-2xl font-light">{metric.value}</p>
            {metric.delta && (
              <span
                className={`badge badge-sm w-fit ${
                  metric.trend === 'down' ? 'badge-error' : 'badge-success'
                }`}>
                {metric.trend === 'down' ? '▼' : '▲'} {metric.delta}
              </span>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);
