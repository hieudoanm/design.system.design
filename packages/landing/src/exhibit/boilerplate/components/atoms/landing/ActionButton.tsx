'use client';

import type { FC } from 'react';

interface ActionButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
  className?: string;
}

const variantClass: Record<
  NonNullable<ActionButtonProps['variant']>,
  string
> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
};

export const ActionButton: FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
}) => (
  <button
    data-testid="action-button"
    type="button"
    className={`btn btn-sm ${variantClass[variant]} ${className}`}
    onClick={onClick}
    disabled={disabled}>
    {label}
  </button>
);
