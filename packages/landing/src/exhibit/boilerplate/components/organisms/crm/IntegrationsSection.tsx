import type { FC, ReactNode } from 'react';

interface Integration {
  name: string;
  description?: string;
  icon?: ReactNode;
}

interface IntegrationsSectionProps {
  title?: string;
  description?: string;
  items: Integration[];
  columns?: number;
  className?: string;
}

export const IntegrationsSection: FC<IntegrationsSectionProps> = ({
  title,
  description,
  items,
  columns = 3,
  className = '',
}) => (
  <div className={`flex flex-col gap-6 ${className}`}>
    {(title || description) && (
      <div className="flex flex-col items-center gap-2 text-center">
        {title && <h2 className="text-2xl font-medium">{title}</h2>}
        {description && (
          <p className="text-base-content/60 max-w-xl text-sm">{description}</p>
        )}
      </div>
    )}
    <div
      className="grid gap-4 sm:grid-cols-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {items.map((item) => (
        <div
          key={item.name}
          className="card bg-base-200 border-base-content/10 border">
          <div className="card-body flex-row items-center gap-3">
            {item.icon && <span className="text-2xl">{item.icon}</span>}
            <div className="flex flex-col">
              <span className="font-medium">{item.name}</span>
              {item.description && (
                <span className="text-base-content/50 text-sm">
                  {item.description}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
