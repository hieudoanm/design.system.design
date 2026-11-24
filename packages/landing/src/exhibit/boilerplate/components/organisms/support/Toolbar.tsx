import type { FC, ReactNode } from 'react';

interface ToolbarProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode[];
  children?: ReactNode;
}

export const Toolbar: FC<ToolbarProps> = ({
  title,
  subtitle,
  actions,
  children,
}) => (
  <div className="border-base-300 bg-base-100 flex flex-col gap-3 border-b px-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      {(title || subtitle) && (
        <div className="flex flex-col gap-0.5">
          {title && <h2 className="text-lg">{title}</h2>}
          {subtitle && (
            <p className="text-base-content/50 text-sm">{subtitle}</p>
          )}
        </div>
      )}
      {actions && actions.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {actions.map((action, index) => (
            <span key={index}>{action}</span>
          ))}
        </div>
      )}
    </div>
    {children}
  </div>
);
