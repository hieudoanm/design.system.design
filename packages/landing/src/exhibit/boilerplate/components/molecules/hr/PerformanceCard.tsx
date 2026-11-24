import type { FC } from 'react';

interface PerformanceCardProps {
  employee: string;
  period: string;
  score: number;
  rating?: string;
  highlights?: string[];
  className?: string;
}

export const PerformanceCard: FC<PerformanceCardProps> = ({
  employee,
  period,
  score,
  rating,
  highlights = [],
  className = '',
}) => {
  return (
    <article
      data-testid="performance-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">{employee}</h3>
        {rating && (
          <span className="badge badge-primary badge-sm">{rating}</span>
        )}
      </div>
      <p className="text-base-content/50 text-xs">{period}</p>
      <div className="mt-3 flex items-center gap-3">
        <span className="text-primary text-2xl font-semibold">{score}</span>
        <progress
          className="progress progress-primary w-full"
          value={score}
          max={100}
          aria-label="Performance score"
        />
      </div>
      {highlights.length > 0 && (
        <ul className="text-base-content/70 mt-3 flex list-disc flex-col gap-1 text-sm">
          {highlights.map((highlight, index) => (
            <li key={`${highlight}-${index}`}>{highlight}</li>
          ))}
        </ul>
      )}
    </article>
  );
};
