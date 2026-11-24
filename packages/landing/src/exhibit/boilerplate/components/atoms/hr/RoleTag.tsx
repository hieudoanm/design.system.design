import type { FC } from 'react';

interface RoleTagProps {
  role: string;
  variant?: 'primary' | 'secondary' | 'neutral';
}

const variantClass: Record<NonNullable<RoleTagProps['variant']>, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  neutral: 'badge-neutral',
};

export const RoleTag: FC<RoleTagProps> = ({ role, variant = 'primary' }) => (
  <span
    data-testid="role-tag"
    className={`badge badge-sm ${variantClass[variant]}`}>
    {role}
  </span>
);
