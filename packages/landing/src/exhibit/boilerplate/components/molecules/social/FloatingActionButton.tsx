import type { FC, ReactNode } from 'react';

type FabPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
type FabSize = 'sm' | 'md' | 'lg';

interface FloatingActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  position?: FabPosition;
  size?: FabSize;
  variant?: 'primary' | 'secondary' | 'accent' | 'neutral';
  disabled?: boolean;
  className?: string;
}

const positionClass: Record<FabPosition, string> = {
  'bottom-right': 'fixed bottom-6 right-6',
  'bottom-left': 'fixed bottom-6 left-6',
  'top-right': 'fixed top-6 right-6',
  'top-left': 'fixed top-6 left-6',
};

const sizeClass: Record<FabSize, string> = {
  sm: 'btn-sm',
  md: 'btn-md',
  lg: 'btn-lg',
};

const variantClass: Record<
  NonNullable<FloatingActionButtonProps['variant']>,
  string
> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  neutral: 'btn-neutral',
};

export const FloatingActionButton: FC<FloatingActionButtonProps> = ({
  icon,
  label,
  onClick,
  position = 'bottom-right',
  size = 'md',
  variant = 'primary',
  disabled = false,
  className = '',
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-circle shadow-lg ${positionClass[position]} ${sizeClass[size]} ${variantClass[variant]} ${className}`}>
    {icon}
  </button>
);
