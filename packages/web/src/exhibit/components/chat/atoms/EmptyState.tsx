import { type FC, type ReactNode } from 'react';
import type { IconType } from 'react-icons';

interface EmptyStateProps {
  icon: IconType;
  title: string;
  description: string;
  action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => (
  <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
    <Icon aria-hidden="true" className="text-base-300 h-14 w-14" />
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-base-content/60 max-w-sm text-sm">{description}</p>
    {action}
  </div>
);
