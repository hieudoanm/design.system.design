'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface FollowButtonProps {
  following?: boolean;
  label?: string;
  followingLabel?: string;
  onToggle?: (following: boolean) => void;
}

export const FollowButton: FC<FollowButtonProps> = ({
  following = false,
  label = 'Follow',
  followingLabel = 'Following',
  onToggle,
}) => {
  const [isFollowing, setIsFollowing] = useState(following);

  const handleToggle = () => {
    const next = !isFollowing;
    setIsFollowing(next);
    onToggle?.(next);
  };

  return (
    <button
      type="button"
      aria-pressed={isFollowing}
      onClick={handleToggle}
      className={`btn btn-xs ${
        isFollowing ? 'btn-ghost border-base-300 border' : 'btn-primary'
      }`}
      data-testid="follow-button">
      {isFollowing ? followingLabel : label}
    </button>
  );
};
