import type { FC, ReactNode } from 'react';

type GlowColor =
  'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';

interface GlowCardProps {
  children: ReactNode;
  color?: GlowColor;
  title?: string;
  className?: string;
}

const glowClass: Record<GlowColor, string> = {
  primary: 'hover:shadow-primary/30',
  secondary: 'hover:shadow-secondary/30',
  accent: 'hover:shadow-accent/30',
  success: 'hover:shadow-success/30',
  warning: 'hover:shadow-warning/30',
  error: 'hover:shadow-error/30',
};

export const GlowCard: FC<GlowCardProps> = ({
  children,
  color = 'primary',
  title,
  className = '',
}) => (
  <div
    className={`card bg-base-200 border-base-content/10 border transition-shadow duration-300 hover:shadow-2xl ${glowClass[color]} ${className}`}>
    <div className="card-body gap-3">
      {title && <h4 className="text-sm font-medium">{title}</h4>}
      {children}
    </div>
  </div>
);

GlowCard.displayName = 'GlowCard';
