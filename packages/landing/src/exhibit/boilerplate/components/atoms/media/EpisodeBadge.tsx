import type { FC } from 'react';

interface EpisodeBadgeProps {
  episode: number;
  label?: string;
  className?: string;
}

export const EpisodeBadge: FC<EpisodeBadgeProps> = ({
  episode,
  label = 'Episode',
  className = '',
}) => (
  <span
    data-testid="episode-badge"
    className={`badge badge-neutral badge-sm ${className}`}>
    {label} {episode}
  </span>
);
