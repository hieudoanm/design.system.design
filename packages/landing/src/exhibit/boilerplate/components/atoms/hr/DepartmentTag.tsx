import type { FC } from 'react';

interface DepartmentTagProps {
  name: string;
  className?: string;
}

export const DepartmentTag: FC<DepartmentTagProps> = ({
  name,
  className = '',
}) => (
  <span
    data-testid="department-tag"
    className={`badge badge-outline badge-sm ${className}`}>
    {name}
  </span>
);
