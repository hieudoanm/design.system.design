import type { FC } from 'react';

interface AttractionCardProps {
  name: string;
  location?: string;
  rating?: number;
  price?: number;
  duration?: string;
  description?: string;
  currency?: string;
}

export const AttractionCard: FC<AttractionCardProps> = ({
  name,
  location,
  rating = 0,
  price,
  duration,
  description,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="attraction-card">
    <div className="card-body gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="card-title text-base">{name}</h3>
        {rating > 0 && (
          <span className="badge badge-primary" data-testid="attraction-rating">
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-base-content/60 text-sm">
        {location && `📍 ${location}`}
        {location && duration && ' · '}
        {duration && `⏱ ${duration}`}
      </p>
      {description && (
        <p className="text-base-content/70 text-sm">{description}</p>
      )}
      {price !== undefined && (
        <p className="font-semibold" data-testid="attraction-price">
          {currency}
          {price.toFixed(2)}
        </p>
      )}
    </div>
  </div>
);
