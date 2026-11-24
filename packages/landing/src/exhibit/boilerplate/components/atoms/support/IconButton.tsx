import type { FC, ReactNode } from 'react';

interface IconButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const variantClass: Record<NonNullable<IconButtonProps['variant']>, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  link: 'btn-link',
};

const sizeClass: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const IconButton: FC<IconButtonProps> = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
}) => (
  <button
    type="button"
    aria-label={label}
    className={`btn btn-circle ${variantClass[variant]} ${sizeClass[size]}`}
    disabled={disabled}
    onClick={onClick}>
    {icon}
  </button>
);
