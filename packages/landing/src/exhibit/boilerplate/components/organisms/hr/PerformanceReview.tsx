import type { FC } from 'react';

interface Review {
  id: string;
  employee: string;
  reviewer: string;
  period: string;
  score: number;
  status: 'completed' | 'scheduled' | 'draft';
}

interface PerformanceReviewProps {
  reviews: Review[];
}

const statusClass: Record<Review['status'], string> = {
  completed: 'badge-success',
  scheduled: 'badge-info',
  draft: 'badge-ghost',
};

const scoreClass = (score: number): string => {
  if (score >= 4) return 'badge-success';
  if (score >= 3) return 'badge-warning';
  return 'badge-error';
};

export const PerformanceReview: FC<PerformanceReviewProps> = ({ reviews }) => {
  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.score, 0) / reviews.length
      : 0;

  return (
    <div
      className="flex w-full flex-col gap-4"
      data-testid="performance-review">
      <div className="card bg-base-200 border-base-content/10 border">
        <div className="card-body">
          <p className="text-base-content/50 text-sm">Average score</p>
          <p className="text-2xl font-semibold">{average.toFixed(1)} / 5</p>
        </div>
      </div>
      <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
        <table className="table-compact table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Reviewer</th>
              <th>Period</th>
              <th>Score</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((review) => (
              <tr key={review.id}>
                <td className="font-medium">{review.employee}</td>
                <td>{review.reviewer}</td>
                <td>{review.period}</td>
                <td>
                  <span
                    className={`badge badge-sm ${scoreClass(review.score)}`}>
                    {review.score.toFixed(1)}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge badge-sm ${statusClass[review.status]}`}>
                    {review.status}
                  </span>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan={5} className="text-base-content/40 text-center">
                  No reviews available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

PerformanceReview.displayName = 'PerformanceReview';
