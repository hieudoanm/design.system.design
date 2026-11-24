import type { FC } from 'react';

interface HeroBadgeProps {
  text: string;
  icon?: string;
}

export const HeroBadge: FC<HeroBadgeProps> = ({ text, icon = '✨' }) => (
  <span
    data-testid="hero-badge"
    className="badge badge-ghost badge-lg border-base-content/10 gap-1">
    {icon && <span aria-hidden="true">{icon}</span>}
    {text}
  </span>
);
