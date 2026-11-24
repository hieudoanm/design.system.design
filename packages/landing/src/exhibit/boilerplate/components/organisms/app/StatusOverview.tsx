import type { FC } from 'react';

interface StatusStat {
  label: string;
  value: string;
  delta?: string;
  positive?: boolean;
}

interface StatusOverviewProps {
  stats: StatusStat[];
}

export const StatusOverview: FC<StatusOverviewProps> = ({ stats }) => (
  <div
    data-testid="status-overview"
    className="stats stats-vertical bg-base-100 sm:stats-horizontal w-full shadow-sm">
    {stats.map((stat) => (
      <div key={stat.label} className="stat">
        <div className="stat-title">{stat.label}</div>
        <div className="stat-value text-2xl">{stat.value}</div>
        {stat.delta && (
          <div
            className={`stat-desc ${stat.positive ? 'text-success' : 'text-error'}`}>
            {stat.delta}
          </div>
        )}
      </div>
    ))}
  </div>
);
