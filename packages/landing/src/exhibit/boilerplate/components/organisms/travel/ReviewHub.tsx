import type { FC } from 'react';

interface TravelReview {
  id: string;
  author: string;
  rating: number;
  destination: string;
  title: string;
  comment: string;
}

interface ReviewHubProps {
  reviews: TravelReview[];
}

export const ReviewHub: FC<ReviewHubProps> = ({ reviews }) => {
  const average =
    reviews.length === 0
      ? 0
      : reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviews.length;

  return (
    <section data-testid="review-hub" className="flex flex-col gap-4">
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
                <div>
                  <h3 className="text-sm font-medium">{review.title}</h3>
                  <p className="text-base-content/50 text-xs">
                    {review.author} &middot; {review.destination}
                  </p>
                </div>
                <span
                  className="text-warning text-sm"
                  aria-label={`${review.rating} star rating`}>
                  {'★'.repeat(review.rating)}
                  {'☆'.repeat(Math.max(0, 5 - review.rating))}
                </span>
              </div>
              <p className="text-base-content/70 text-sm">{review.comment}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
