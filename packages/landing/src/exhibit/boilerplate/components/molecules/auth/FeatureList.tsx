import type { FC, ReactNode } from 'react';

interface FeatureListFeature {
  icon: ReactNode;
  title: string;
  description?: string;
}

interface FeatureListProps {
  items: FeatureListFeature[];
  columns?: 1 | 2;
  className?: string;
}

const columnsClass: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
};

export const FeatureList: FC<FeatureListProps> = ({
  items,
  columns = 1,
  className = '',
}) => (
  <div className={`grid ${columnsClass[columns]} gap-3 ${className}`}>
    {items.map((item) => (
      <div
        key={item.title}
        className="border-base-content/10 flex items-start gap-3 rounded-xl border p-3">
        <div className="bg-base-200 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
          {item.icon}
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{item.title}</span>
          {item.description && (
            <span className="text-base-content/60 text-sm">
              {item.description}
            </span>
          )}
        </div>
      </div>
    ))}
  </div>
);

FeatureList.displayName = 'FeatureList';
