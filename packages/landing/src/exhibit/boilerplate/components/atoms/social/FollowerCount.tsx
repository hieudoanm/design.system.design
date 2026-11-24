import type { FC } from 'react';

interface FollowerCountProps {
  count: number;
  label?: string;
}

const formatCount = (count: number): string => {
  if (count >= 1_000_000)
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (count >= 1_000)
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return `${count}`;
};

export const FollowerCount: FC<FollowerCountProps> = ({
  count,
  label = 'followers',
}) => (
  <span className="text-base-content/60 text-sm" data-testid="follower-count">
    {formatCount(count)} {label}
  </span>
);
