import type { FC } from 'react';

interface ListedProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  badge?: string;
}

interface ProductListProps {
  products: ListedProduct[];
  onAddToCart?: (id: string) => void;
}

export const ProductList: FC<ProductListProps> = ({
  products,
  onAddToCart,
}) => {
  if (products.length === 0) {
    return (
      <section data-testid="product-list" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">No products found</p>
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="product-list"
      className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {products.map((product) => (
        <article key={product.id} className="card bg-base-200">
          <figure className="bg-primary/10 flex aspect-square items-center justify-center">
            <span className="text-base-content/30 text-4xl" aria-hidden="true">
              &#9632;
            </span>
            {product.badge && (
              <span className="badge badge-secondary absolute top-2 right-2">
                {product.badge}
              </span>
            )}
          </figure>
          <div className="card-body gap-1 p-4">
            <h3 className="text-sm font-medium">{product.name}</h3>
            <p className="text-base-content/50 text-xs">
              <span className="text-warning" aria-hidden="true">
                &#9733;
              </span>{' '}
              {product.rating}/5
            </p>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-semibold">
                ${product.price.toFixed(2)}
              </span>
              <button
                type="button"
                className="btn btn-primary btn-xs"
                onClick={() => onAddToCart?.(product.id)}>
                Add
              </button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
};
