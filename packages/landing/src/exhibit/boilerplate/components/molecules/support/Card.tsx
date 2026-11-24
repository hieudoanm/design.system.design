import type { FC, ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}

export const Card: FC<CardProps> = ({
  title,
  description,
  action,
  children,
}) => (
  <div className="card bg-base-200 border-base-content/10 border">
    <div className="card-body">
      {(title || description || action) && (
        <div className="flex items-start justify-between">
          <div>
            {title && <h2 className="card-title">{title}</h2>}
            {description && (
              <p className="text-base-content/50 text-sm">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  </div>
);
