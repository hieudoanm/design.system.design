import type { FC } from 'react';

interface RatingLabelProps {
  score: number;
  label?: string;
}

export const RatingLabel: FC<RatingLabelProps> = ({
  score,
  label = 'Rating',
}) => (
  <span className="badge badge-secondary gap-1" data-testid="rating-label">
    <span className="text-warning">★</span>
    {label} {score.toFixed(1)}
  </span>
);
