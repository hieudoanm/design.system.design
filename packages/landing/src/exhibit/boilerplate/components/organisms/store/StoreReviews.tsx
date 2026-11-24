import type { FC } from 'react';

interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  comment: string;
  verified?: boolean;
}

interface StoreReviewsProps {
  reviews: Review[];
}

const renderStars = (rating: number): string => {
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(Math.max(0, 5 - rating));
  return `${filled}${empty}`;
};

export const StoreReviews: FC<StoreReviewsProps> = ({ reviews }) => {
  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  return (
    <section data-testid="store-reviews" className="flex flex-col gap-4">
      <div className="stats w-full shadow">
        <div className="stat">
          <div className="stat-title">Average rating</div>
          <div className="stat-value text-lg">{average.toFixed(1)}</div>
        </div>
        <div className="stat">
          <div className="stat-title">Reviews</div>
          <div className="stat-value text-lg">{reviews.length}</div>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {reviews.length === 0 && (
          <p className="text-base-content/60 text-center text-sm">
            No reviews yet
          </p>
        )}
        {reviews.map((review) => (
          <article key={review.id} className="card bg-base-200">
            <div className="card-body gap-2 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="avatar placeholder">
                    <div className="bg-secondary text-secondary-content w-8 rounded-full">
                      <span className="text-xs">{review.author.charAt(0)}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{review.author}</span>
                  {review.verified && (
                    <span className="badge badge-success badge-sm">
                      Verified
                    </span>
                  )}
                </div>
                <span
                  className="text-warning text-sm"
                  aria-label={`${review.rating} star rating`}>
                  {renderStars(review.rating)}
                </span>
              </div>
              <h3 className="text-sm font-medium">{review.title}</h3>
              <p className="text-base-content/70 text-sm">{review.comment}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
