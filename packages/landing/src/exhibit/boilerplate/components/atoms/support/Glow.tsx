import type { FC, ReactNode } from 'react';

type GlowColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

type GlowSize = 'sm' | 'md' | 'lg';

interface GlowProps {
  children: ReactNode;
  color?: GlowColor;
  size?: GlowSize;
  className?: string;
}

const colorClass: Record<GlowColor, string> = {
  primary: 'bg-primary/60',
  secondary: 'bg-secondary/60',
  accent: 'bg-accent/60',
  neutral: 'bg-base-content/40',
  info: 'bg-info/60',
  success: 'bg-success/60',
  warning: 'bg-warning/60',
  error: 'bg-error/60',
};

const sizeClass: Record<GlowSize, string> = {
  sm: 'h-4 w-4 blur-sm',
  md: 'h-8 w-8 blur-md',
  lg: 'h-12 w-12 blur-lg',
};

export const Glow: FC<GlowProps> = ({
  children,
  color = 'primary',
  size = 'md',
  className = '',
}) => (
  <span className={`relative inline-flex ${className}`}>
    <span
      aria-hidden="true"
      className={`${colorClass[color]} ${sizeClass[size]} pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full`}
    />
    <span className="relative">{children}</span>
  </span>
);

Glow.displayName = 'Glow';
