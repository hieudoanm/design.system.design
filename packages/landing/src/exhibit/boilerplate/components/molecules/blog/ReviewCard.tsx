import type { FC } from 'react';
import { FiStar } from 'react-icons/fi';

interface ReviewCardProps {
  quote: string;
  author: string;
  role?: string;
  rating?: number;
  initials?: string;
  className?: string;
}

const clamp = (n: number, min: number, max: number): number =>
  Math.min(Math.max(n, min), max);

export const ReviewCard: FC<ReviewCardProps> = ({
  quote,
  author,
  role,
  rating,
  initials,
  className = '',
}) => {
  const safeRating = clamp(Math.round(rating ?? 0), 0, 5);

  return (
    <figure className="card bg-base-200 border-base-content/10 border p-5">
      <div className="flex flex-col gap-3">
        {safeRating > 0 && (
          <div
            className="flex gap-0.5"
            role="img"
            aria-label={`Rated ${safeRating} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <FiStar
                key={index}
                className={`h-4 w-4 ${
                  index < safeRating
                    ? 'fill-warning text-warning'
                    : 'text-base-content/20'
                }`}
              />
            ))}
          </div>
        )}
        <blockquote className="text-base-content/80 text-sm leading-relaxed">
          “{quote}”
        </blockquote>
        <figcaption className="flex items-center gap-2">
          {initials && (
            <span className="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
              {initials}
            </span>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-medium">{author}</span>
            {role && (
              <span className="text-base-content/50 text-xs">{role}</span>
            )}
          </div>
        </figcaption>
      </div>
    </figure>
  );
};

ReviewCard.displayName = 'ReviewCard';
