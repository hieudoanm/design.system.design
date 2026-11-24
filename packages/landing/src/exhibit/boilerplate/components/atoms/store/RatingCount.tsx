import type { FC } from 'react';

interface RatingCountProps {
  rating: number;
  count: number;
}

export const RatingCount: FC<RatingCountProps> = ({ rating, count }) => (
  <span
    className="inline-flex items-center gap-1 text-sm"
    data-testid="rating-count">
    <span className="text-warning">★</span>
    <span className="font-medium">{rating.toFixed(1)}</span>
    <span className="text-base-content/60">({count})</span>
  </span>
);
