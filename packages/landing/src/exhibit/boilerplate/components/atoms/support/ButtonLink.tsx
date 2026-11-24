import Link from '@/exhibit/boilerplate/link';
import type { FC, ReactNode } from 'react';

interface ButtonLinkProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantClass: Record<NonNullable<ButtonLinkProps['variant']>, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  accent: 'btn-accent',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  link: 'btn-link',
};

const sizeClass: Record<NonNullable<ButtonLinkProps['size']>, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export const ButtonLink: FC<ButtonLinkProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => (
  <Link
    href={href}
    className={`btn ${variantClass[variant]} ${sizeClass[size]} ${className}`}>
    {children}
  </Link>
);
