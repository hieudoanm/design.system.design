import type { FC } from 'react';

interface StoreReviewCardProps {
  author: string;
  rating: number;
  comment: string;
  date?: string;
  verified?: boolean;
}

const renderStars = (rating: number) =>
  `${'★'.repeat(Math.round(rating))}${'☆'.repeat(5 - Math.round(rating))}`;

export const StoreReviewCard: FC<StoreReviewCardProps> = ({
  author,
  rating,
  comment,
  date,
  verified = false,
}) => (
  <div
    className="card bg-base-100 w-full shadow"
    data-testid="store-review-card">
    <div className="card-body gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="avatar placeholder">
            <span className="bg-primary text-neutral-content w-8 rounded-full text-sm">
              {author.charAt(0).toUpperCase()}
            </span>
          </span>
          <span className="font-medium">{author}</span>
          {verified && (
            <span className="badge badge-success badge-sm">Verified</span>
          )}
        </div>
        <span className="text-amber-500" data-testid="review-rating">
          {renderStars(rating)}
        </span>
      </div>
      <p className="text-sm">{comment}</p>
      {date && <p className="text-base-content/60 text-xs">{date}</p>}
    </div>
  </div>
);
