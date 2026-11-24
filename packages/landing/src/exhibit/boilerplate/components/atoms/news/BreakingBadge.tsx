import type { FC } from 'react';

interface BreakingBadgeProps {
  label?: string;
  pulse?: boolean;
}

export const BreakingBadge: FC<BreakingBadgeProps> = ({
  label = 'Breaking',
  pulse = true,
}) => (
  <span className="badge badge-error gap-1.5" data-testid="breaking-badge">
    <span
      aria-hidden
      className={`h-1.5 w-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`}
    />
    {label}
  </span>
);
