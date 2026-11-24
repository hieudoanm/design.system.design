import type { FC, ReactNode } from 'react';

interface EmptyPlaceholderProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export const EmptyPlaceholder: FC<EmptyPlaceholderProps> = ({
  icon,
  title = 'Nothing here yet',
  description,
  action,
  className = '',
}) => (
  <div
    className={`border-base-content/15 bg-base-200/50 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-8 text-center ${className}`}>
    {icon && <div className="text-base-content/40 text-4xl">{icon}</div>}
    {title && <p className="text-sm font-medium">{title}</p>}
    {description && (
      <p className="text-base-content/50 max-w-xs text-sm">{description}</p>
    )}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
