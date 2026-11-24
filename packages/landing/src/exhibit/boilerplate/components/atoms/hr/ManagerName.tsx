import type { FC } from 'react';

interface ManagerNameProps {
  name: string;
  className?: string;
}

export const ManagerName: FC<ManagerNameProps> = ({ name, className = '' }) => (
  <span data-testid="manager-name" className={`text-sm ${className}`}>
    <span aria-hidden="true" className="mr-1">
      👤
    </span>
    {name}
  </span>
);
