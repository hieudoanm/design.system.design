import type { FC, ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}

export const PageHeader: FC<PageHeaderProps> = ({
  title,
  description,
  eyebrow,
  actions,
  className = '',
}) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    {eyebrow && (
      <span className="text-primary font-mono text-xs tracking-widest uppercase">
        {eyebrow}
      </span>
    )}
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-medium">{title}</h1>
        {description && (
          <p className="text-base-content/60 text-sm">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  </div>
);
