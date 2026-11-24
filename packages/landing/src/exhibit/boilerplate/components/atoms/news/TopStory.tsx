import type { FC } from 'react';

interface TopStoryProps {
  label?: string;
  rank?: number;
}

export const TopStory: FC<TopStoryProps> = ({ label = 'Top Story', rank }) => (
  <span className="badge badge-warning badge-sm gap-1" data-testid="top-story">
    <span aria-hidden>★</span>
    {rank ? `${label} #${rank}` : label}
  </span>
);
