import type { FC } from 'react';

interface BundleCardProps {
  title: string;
  items: string[];
  price: number;
  originalPrice?: number;
  currency?: string;
  badge?: string;
}

export const BundleCard: FC<BundleCardProps> = ({
  title,
  items,
  price,
  originalPrice,
  currency = '$',
  badge,
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="bundle-card">
    <div className="card-body gap-3">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{title}</h3>
        {badge && <span className="badge badge-secondary">{badge}</span>}
      </div>
      <ul className="flex flex-col gap-1 text-sm">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <span className="text-success">✓</span>
            {item}
          </li>
        ))}
      </ul>
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold" data-testid="bundle-price">
          {currency}
          {price.toFixed(2)}
        </span>
        {originalPrice !== undefined && (
          <span
            className="text-base-content/50 text-sm line-through"
            data-testid="bundle-original">
            {currency}
            {originalPrice.toFixed(2)}
          </span>
        )}
      </div>
    </div>
  </div>
);
