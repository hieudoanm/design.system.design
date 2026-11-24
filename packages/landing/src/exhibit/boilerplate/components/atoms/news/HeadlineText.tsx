import type { FC } from 'react';

interface HeadlineTextProps {
  children: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClass = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' } as const;

export const HeadlineText: FC<HeadlineTextProps> = ({
  children,
  size = 'md',
  className = '',
}) => (
  <h2
    className={`font-mono font-light tracking-tight ${sizeClass[size]} ${className}`}
    data-testid="headline-text">
    {children}
  </h2>
);
