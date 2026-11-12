import type { FC, ReactNode } from 'react';

interface EmptyStateProps {
  children: ReactNode;
  className?: string;
}

export const EmptyState: FC<EmptyStateProps> = ({
  children,
  className = '',
}) => (
  <p className={`text-base-content/50 text-sm ${className}`.trim()}>
    {children}
  </p>
);
