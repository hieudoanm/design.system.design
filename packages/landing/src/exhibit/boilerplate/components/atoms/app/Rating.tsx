import type { FC } from 'react';

interface RatingProps {
  value: number;
  max?: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass: Record<NonNullable<RatingProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-2xl',
};

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

export const Rating: FC<RatingProps> = ({
  value,
  max = 5,
  onChange,
  size = 'md',
}) => {
  const safeMax = max <= 0 ? 5 : max;
  const current = clamp(value, 0, safeMax);
  const stars = Array.from({ length: safeMax }, (_, i) => i + 1);

  return (
    <div className={`rating rating-lg ${sizeClass[size]}`} role="radiogroup">
      {stars.map((star) => {
        const filled = star <= current;
        const starClass = `mask mask-star-2 ${filled ? 'bg-amber-400' : 'bg-base-300'}`;
        if (!onChange) {
          return (
            <span
              key={star}
              aria-label={`${filled ? 'filled' : 'empty'} ${star} of ${safeMax} stars`}
              className={`${starClass} cursor-default`}
            />
          );
        }
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-label={`Rate ${star} of ${safeMax} stars`}
            aria-checked={filled}
            onClick={() => onChange(star)}
            className={starClass}
          />
        );
      })}
    </div>
  );
};
