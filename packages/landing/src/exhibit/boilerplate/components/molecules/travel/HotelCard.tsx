import type { FC } from 'react';

interface HotelCardProps {
  name: string;
  location: string;
  pricePerNight: number;
  rating?: number;
  stars?: number;
  imageLabel?: string;
  currency?: string;
}

export const HotelCard: FC<HotelCardProps> = ({
  name,
  location,
  pricePerNight,
  rating = 0,
  stars = 0,
  imageLabel = 'Hotel image',
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="hotel-card">
    <figure className="bg-base-200 flex h-36 items-center justify-center">
      <span className="text-base-content/60 text-sm tracking-widest uppercase">
        {imageLabel}
      </span>
    </figure>
    <div className="card-body gap-1">
      <div className="flex items-start justify-between gap-2">
        <h3 className="card-title text-base">{name}</h3>
        {rating > 0 && (
          <span className="badge badge-primary" data-testid="hotel-rating">
            ★ {rating.toFixed(1)}
          </span>
        )}
      </div>
      <p className="text-base-content/60 text-sm">📍 {location}</p>
      {stars > 0 && (
        <p className="text-sm text-amber-500" data-testid="hotel-stars">
          {'★'.repeat(stars)}
          {'☆'.repeat(Math.max(0, 5 - stars))}
        </p>
      )}
      <p className="mt-2 font-semibold" data-testid="hotel-price">
        {currency}
        {pricePerNight.toFixed(2)}
        <span className="text-base-content/60 text-sm font-normal">
          {' '}
          / night
        </span>
      </p>
    </div>
  </div>
);
