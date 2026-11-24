import type { FC } from 'react';

interface ProductCatalogCardProps {
  name: string;
  price: number;
  sku: string;
  category?: string;
  stock?: number;
  imageSrc?: string;
  currency?: string;
}

export const ProductCatalogCard: FC<ProductCatalogCardProps> = ({
  name,
  price,
  sku,
  category,
  stock,
  imageSrc,
  currency = '$',
}) => (
  <article
    data-testid="product-catalog-card"
    className="card bg-base-100 shadow-sm">
    <figure className="bg-base-200 flex h-32 items-center justify-center">
      {imageSrc ? (
        <img src={imageSrc} alt={name} className="h-full w-full object-cover" />
      ) : (
        <svg
          className="text-base-content/30 h-10 w-10"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"
          />
        </svg>
      )}
    </figure>
    <div className="card-body">
      <div className="flex items-start justify-between gap-2">
        <h3 className="card-title text-base">{name}</h3>
        <span className="badge badge-ghost badge-sm">{sku}</span>
      </div>
      {category && <p className="text-base-content/50 text-sm">{category}</p>}
      <div className="flex items-center justify-between">
        <p className="text-lg font-bold">
          {currency}
          {price.toLocaleString()}
        </p>
        {stock !== undefined && (
          <span
            className={`badge badge-sm ${
              stock > 0 ? 'badge-success' : 'badge-error'
            }`}>
            {stock > 0 ? `In stock: ${stock}` : 'Out of stock'}
          </span>
        )}
      </div>
    </div>
  </article>
);

ProductCatalogCard.displayName = 'ProductCatalogCard';
