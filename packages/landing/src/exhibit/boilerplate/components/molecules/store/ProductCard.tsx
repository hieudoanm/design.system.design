import type { FC } from 'react';

interface ProductCardProps {
  name: string;
  price: number;
  imageLabel?: string;
  rating?: number;
  reviews?: number;
  badge?: string;
  currency?: string;
}

export const ProductCard: FC<ProductCardProps> = ({
  name,
  price,
  imageLabel = 'Product image',
  rating = 0,
  reviews = 0,
  badge,
  currency = '$',
}) => (
  <div className="card bg-base-100 w-full shadow-xl" data-testid="product-card">
    <figure className="bg-base-200 flex h-40 items-center justify-center">
      <span className="text-base-content/60 text-sm tracking-widest uppercase">
        {imageLabel}
      </span>
    </figure>
    <div className="card-body">
      {badge && <span className="badge badge-primary self-start">{badge}</span>}
      <h3 className="card-title text-base">{name}</h3>
      <p className="text-lg font-semibold" data-testid="product-price">
        {currency}
        {price.toFixed(2)}
      </p>
      {rating > 0 && (
        <p
          className="text-base-content/70 text-sm"
          data-testid="product-rating">
          ★ {rating.toFixed(1)} ({reviews} reviews)
        </p>
      )}
    </div>
  </div>
);
