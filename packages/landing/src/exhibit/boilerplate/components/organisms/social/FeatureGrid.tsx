import type { FC, ReactNode } from 'react';

interface Feature {
  icon: ReactNode;
  title: string;
  description: string;
}

interface FeatureGridProps {
  features: Feature[];
  columns?: 1 | 2 | 3 | 4;
}

const gridClass: Record<NonNullable<FeatureGridProps['columns']>, string> = {
  1: 'grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export const FeatureGrid: FC<FeatureGridProps> = ({
  features,
  columns = 3,
}) => (
  <div className={`grid gap-4 ${gridClass[columns]}`}>
    {features.map((feature) => (
      <div
        key={feature.title}
        className="card bg-base-200 border-base-content/10 border">
        <div className="card-body">
          <div className="text-2xl">{feature.icon}</div>
          <h3 className="card-title">{feature.title}</h3>
          <p className="text-base-content/50 text-sm">{feature.description}</p>
        </div>
      </div>
    ))}
  </div>
);
