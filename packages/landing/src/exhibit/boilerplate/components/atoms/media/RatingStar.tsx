'use client';

import type { FC } from 'react';

interface RatingStarProps {
  rating: number;
  onChange?: (rating: number) => void;
  max?: number;
  className?: string;
}

const starPath =
  'M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z';

export const RatingStar: FC<RatingStarProps> = ({
  rating,
  onChange,
  max = 5,
  className = '',
}) => {
  const stars = Array.from({ length: max }, (_, i) => i + 1);
  return (
    <div
      data-testid="rating-star"
      className={`inline-flex items-center gap-0.5 ${className}`}>
      {stars.map((i) => (
        <button
          key={i}
          type="button"
          aria-label={`Rate ${i} of ${max}`}
          aria-pressed={i <= rating}
          onClick={() => onChange?.(i)}
          className="btn btn-ghost btn-xs p-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={i <= rating ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            data-testid={`rating-star-${i}`}
            className={`h-4 w-4 ${i <= rating ? 'fill-yellow-500 text-yellow-500' : 'text-base-content/40'}`}>
            <path d={starPath} />
          </svg>
        </button>
      ))}
    </div>
  );
};
