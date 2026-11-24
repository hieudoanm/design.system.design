import Link from '@/exhibit/boilerplate/link';
import type { FC, ReactNode } from 'react';

interface LinkButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'link';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LinkButton: FC<LinkButtonProps> = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
}) => (
  <Link href={href} className={`btn btn-${variant} btn-${size} ${className}`}>
    {children}
  </Link>
);
