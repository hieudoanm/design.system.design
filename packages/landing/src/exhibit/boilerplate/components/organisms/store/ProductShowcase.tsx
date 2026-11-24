import type { FC } from 'react';

interface Product {
  name: string;
  brand: string;
  price: number;
  rating: number;
  description: string;
  features: string[];
}

interface ProductShowcaseProps {
  product: Product;
  onAddToCart?: () => void;
}

const renderStars = (rating: number): string => {
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(Math.max(0, 5 - rating));
  return `${filled}${empty}`;
};

export const ProductShowcase: FC<ProductShowcaseProps> = ({
  product,
  onAddToCart,
}) => {
  return (
    <section
      data-testid="product-showcase"
      className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="bg-base-200 flex aspect-square items-center justify-center rounded-2xl">
        <span className="text-base-content/30 text-6xl" aria-hidden="true">
          &#9678;
        </span>
      </div>
      <div className="flex flex-col gap-4">
        <div>
          <p className="text-base-content/50 text-sm">{product.brand}</p>
          <h1 className="text-2xl font-medium">{product.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-warning" aria-label={`${product.rating} stars`}>
            {renderStars(product.rating)}
          </span>
          <span className="text-base-content/50 text-sm">
            {product.rating}/5
          </span>
        </div>
        <p className="text-2xl font-medium">${product.price.toFixed(2)}</p>
        <p className="text-base-content/70">{product.description}</p>
        <ul className="list-inside list-disc">
          {product.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="btn btn-primary"
            onClick={onAddToCart}>
            Add to cart
          </button>
          <button type="button" className="btn btn-outline">
            Buy now
          </button>
        </div>
      </div>
    </section>
  );
};
