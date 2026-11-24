import type { FC, ReactNode } from 'react';
import { Stat } from '../../molecules/app/Stat';

interface StatItem {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  variant?:
    'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

interface StatsGridProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
}

const gridClass: Record<NonNullable<StatsGridProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export const StatsGrid: FC<StatsGridProps> = ({ stats, columns = 4 }) => (
  <div className={`grid gap-3 ${gridClass[columns]}`}>
    {stats.map((stat) => (
      <div
        key={stat.label}
        className="bg-base-200 border-base-content/10 rounded-xl border">
        <Stat
          label={stat.label}
          value={stat.value}
          icon={stat.icon}
          description={stat.description}
          variant={stat.variant}
        />
      </div>
    ))}
  </div>
);
