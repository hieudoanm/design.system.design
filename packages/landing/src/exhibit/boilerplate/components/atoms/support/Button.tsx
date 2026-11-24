import type { FC, ReactNode } from 'react';

type ButtonVariant =
  'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'link';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  children: ReactNode;
}

const variantClass: Record<ButtonVariant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  link: 'btn-link',
};

const sizeClass: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const Button: FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  children,
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled || loading}
    className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`}>
    {loading && <span className="loading loading-spinner loading-xs" />}
    {children}
  </button>
);
