import type { FC, ReactNode } from 'react';

interface DashboardWidgetProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}

export const DashboardWidget: FC<DashboardWidgetProps> = ({
  title,
  subtitle,
  action,
  className = '',
  children,
}) => (
  <section
    data-testid="dashboard-widget"
    className={`card bg-base-100 border-base-200 border shadow-sm ${className}`}>
    <div className="card-body">
      <div className="card-title flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg">{title}</h3>
          {subtitle && (
            <p className="text-base-content/50 mt-1 text-sm">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      {children}
    </div>
  </section>
);
