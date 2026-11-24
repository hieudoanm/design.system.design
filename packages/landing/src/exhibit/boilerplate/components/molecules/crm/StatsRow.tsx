import type { FC } from 'react';

interface StatValue {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface StatsRowProps {
  stats: StatValue[];
}

const trendClass: Record<NonNullable<StatValue['trend']>, string> = {
  up: 'text-success',
  down: 'text-error',
  neutral: 'text-base-content/50',
};

export const StatsRow: FC<StatsRowProps> = ({ stats }) => (
  <section
    data-testid="stats-row"
    className="grid grid-cols-2 gap-4 lg:grid-cols-4">
    {stats.map((stat) => (
      <div key={stat.label} className="card bg-base-100 shadow-sm">
        <div className="card-body">
          <p className="text-base-content/60 text-sm">{stat.label}</p>
          <p className="text-2xl font-bold">{stat.value}</p>
          {stat.change && (
            <p
              className={`text-sm ${
                stat.trend ? trendClass[stat.trend] : 'text-base-content/50'
              }`}>
              {stat.change}
            </p>
          )}
        </div>
      </div>
    ))}
  </section>
);

StatsRow.displayName = 'StatsRow';
