import type { FC } from 'react';

interface StoreCardProps {
  name: string;
  rating?: number;
  reviewCount?: number;
  deliveryTime?: string;
  category?: string;
  logoLabel?: string;
}

export const StoreCard: FC<StoreCardProps> = ({
  name,
  rating = 0,
  reviewCount = 0,
  deliveryTime,
  category,
  logoLabel = 'Store',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="store-card">
    <div className="card-body items-center text-center">
      <span className="avatar placeholder">
        <span className="bg-secondary text-secondary-content w-14 rounded-full text-lg">
          {logoLabel.charAt(0).toUpperCase()}
        </span>
      </span>
      <h3 className="card-title text-base">{name}</h3>
      {category && <span className="badge badge-ghost">{category}</span>}
      {rating > 0 && (
        <p className="text-base-content/70 text-sm" data-testid="store-rating">
          ★ {rating.toFixed(1)} ({reviewCount} reviews)
        </p>
      )}
      {deliveryTime && (
        <p className="text-base-content/60 text-xs">Delivery {deliveryTime}</p>
      )}
    </div>
  </div>
);
