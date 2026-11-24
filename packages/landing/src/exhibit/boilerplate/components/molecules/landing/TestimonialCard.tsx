import type { FC } from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  company?: string;
  rating?: number;
  initials?: string;
  className?: string;
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export const TestimonialCard: FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  company,
  rating,
  initials,
  className = '',
}) => {
  const safeRating = clamp(Math.round(rating ?? 0), 0, 5);
  const fallback = initials ?? initialsOf(author);
  const meta = [role, company]
    .filter((item): item is string => Boolean(item))
    .join(' · ');

  return (
    <figure
      data-testid="testimonial-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex flex-col gap-3">
        {safeRating > 0 && (
          <div
            className="text-warning flex gap-0.5"
            role="img"
            aria-label={`Rated ${safeRating} out of 5`}>
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={index < safeRating ? '' : 'text-base-content/20'}>
                ★
              </span>
            ))}
          </div>
        )}
        <blockquote className="text-base-content/80 text-sm leading-relaxed">
          “{quote}”
        </blockquote>
        <figcaption className="flex items-center gap-2">
          <span className="bg-primary text-primary-content flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold">
            {fallback}
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{author}</span>
            {meta && (
              <span className="text-base-content/50 text-xs">{meta}</span>
            )}
          </div>
        </figcaption>
      </div>
    </figure>
  );
};
