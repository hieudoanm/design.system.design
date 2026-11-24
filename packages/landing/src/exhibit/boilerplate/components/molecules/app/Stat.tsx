import type { FC, ReactNode } from 'react';

interface StatProps {
  label: string;
  value: string;
  icon?: ReactNode;
  description?: string;
  variant?:
    'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

const iconClass: Record<NonNullable<StatProps['variant']>, string> = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  accent: 'text-accent',
  success: 'text-success',
  warning: 'text-warning',
  error: 'text-error',
};

export const Stat: FC<StatProps> = ({
  label,
  value,
  icon,
  description,
  variant = 'primary',
}) => (
  <div className="stat">
    <div className="stat-figure text-2xl">
      {icon && <span className={iconClass[variant]}>{icon}</span>}
    </div>
    <div className="stat-title text-base-content/50 text-sm">{label}</div>
    <div className="stat-value text-2xl">{value}</div>
    {description && (
      <div className="stat-desc text-base-content/50 text-sm">
        {description}
      </div>
    )}
  </div>
);
