import type { FC, ReactNode } from 'react';

interface VisuallyHiddenProps {
  children: ReactNode;
  className?: string;
}

export const VisuallyHidden: FC<VisuallyHiddenProps> = ({
  children,
  className = '',
}) => <span className={`sr-only ${className}`}>{children}</span>;

VisuallyHidden.displayName = 'VisuallyHidden';
