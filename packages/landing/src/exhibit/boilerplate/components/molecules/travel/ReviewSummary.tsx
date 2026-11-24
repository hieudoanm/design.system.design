import type { FC } from 'react';

interface ReviewBreakdown {
  stars: number;
  count: number;
}

interface ReviewSummaryProps {
  average: number;
  count: number;
  breakdown?: ReviewBreakdown[];
}

export const ReviewSummary: FC<ReviewSummaryProps> = ({
  average,
  count,
  breakdown = [],
}) => {
  const max = breakdown.reduce(
    (biggest, item) => Math.max(biggest, item.count),
    0
  );
  const sorted = [...breakdown].sort((a, b) => b.stars - a.stars);

  return (
    <div
      className="card bg-base-100 w-full shadow"
      data-testid="review-summary">
      <div className="card-body gap-3">
        <div className="flex items-center gap-4">
          <span className="text-4xl font-bold" data-testid="review-average">
            {average.toFixed(1)}
          </span>
          <div className="flex flex-col gap-0.5">
            <span className="text-lg text-amber-500">
              {'★'.repeat(Math.round(average))}
              {'☆'.repeat(5 - Math.round(average))}
            </span>
            <span className="text-base-content/60 text-sm">
              {count} reviews
            </span>
          </div>
        </div>
        {sorted.length > 0 && (
          <div className="flex flex-col gap-1" data-testid="review-breakdown">
            {sorted.map((item) => (
              <div key={item.stars} className="flex items-center gap-2 text-sm">
                <span className="w-8">{item.stars}★</span>
                <progress
                  className="progress progress-primary h-2 flex-1"
                  value={item.count}
                  max={max > 0 ? max : 1}
                  data-testid={`review-bar-${item.stars}`}
                />
                <span className="text-base-content/60 w-6 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
