import type { FC } from 'react';

interface DestinationCardProps {
  name: string;
  country?: string;
  price?: number;
  rating?: number;
  imageLabel?: string;
  currency?: string;
}

export const DestinationCard: FC<DestinationCardProps> = ({
  name,
  country,
  price,
  rating = 0,
  imageLabel = 'Destination image',
  currency = '$',
}) => (
  <div
    className="card bg-base-100 w-full shadow"
    data-testid="destination-card">
    <figure className="bg-base-200 flex h-32 items-center justify-center">
      <span className="text-base-content/60 text-sm tracking-widest uppercase">
        {imageLabel}
      </span>
    </figure>
    <div className="card-body gap-1">
      <h3 className="card-title text-base">{name}</h3>
      {country && <p className="text-base-content/60 text-sm">{country}</p>}
      <div className="flex items-center justify-between">
        {rating > 0 && (
          <span
            className="text-sm text-amber-500"
            data-testid="destination-rating">
            ★ {rating.toFixed(1)}
          </span>
        )}
        {price !== undefined && (
          <span className="font-semibold" data-testid="destination-price">
            {currency}
            {price.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  </div>
);
