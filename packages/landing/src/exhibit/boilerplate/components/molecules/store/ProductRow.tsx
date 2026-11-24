import type { FC } from 'react';

interface ProductRowProps {
  name: string;
  price: number;
  sku?: string;
  category?: string;
  inStock?: boolean;
  currency?: string;
}

export const ProductRow: FC<ProductRowProps> = ({
  name,
  price,
  sku,
  category,
  inStock = true,
  currency = '$',
}) => (
  <div
    className="border-base-300 flex items-center justify-between gap-4 border-b py-3"
    data-testid="product-row">
    <div className="flex min-w-0 flex-col gap-0.5">
      <span className="font-medium">{name}</span>
      <span
        className="text-base-content/60 text-sm"
        data-testid="product-row-meta">
        {[sku, category].filter(Boolean).join(' · ') || 'No sku'}
      </span>
    </div>
    <div className="flex items-center gap-3">
      <span
        className={`badge ${inStock ? 'badge-success' : 'badge-error'}`}
        data-testid="product-row-stock">
        {inStock ? 'In stock' : 'Out of stock'}
      </span>
      <span className="font-semibold" data-testid="product-row-price">
        {currency}
        {price.toFixed(2)}
      </span>
    </div>
  </div>
);
