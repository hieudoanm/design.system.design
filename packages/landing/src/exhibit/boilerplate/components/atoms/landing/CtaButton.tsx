'use client';

import type { FC } from 'react';

interface CtaButtonProps {
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'outline';
  disabled?: boolean;
}

const variantClass: Record<NonNullable<CtaButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  outline: 'btn-outline',
};

export const CtaButton: FC<CtaButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
}) => (
  <button
    data-testid="cta-button"
    type="button"
    className={`btn ${variantClass[variant]}`}
    onClick={onClick}
    disabled={disabled}>
    {label}
  </button>
);
