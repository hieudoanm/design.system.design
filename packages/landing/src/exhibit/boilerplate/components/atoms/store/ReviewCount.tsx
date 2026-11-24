import type { FC } from 'react';

interface ReviewCountProps {
  count: number;
}

export const ReviewCount: FC<ReviewCountProps> = ({ count }) => (
  <span className="text-base-content/60 text-sm" data-testid="review-count">
    {count} {count === 1 ? 'review' : 'reviews'}
  </span>
);
