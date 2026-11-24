import type { FC } from 'react';

interface NewProduct {
  id: string;
  name: string;
  price: number;
  category: string;
}

interface NewArrivalsProps {
  products: NewProduct[];
}

export const NewArrivals: FC<NewArrivalsProps> = ({ products }) => {
  return (
    <section data-testid="new-arrivals" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">New arrivals</h2>
        <button type="button" className="btn btn-ghost btn-sm">
          View all
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <article key={product.id} className="card bg-base-200">
            <figure className="bg-accent/20 relative flex aspect-square items-center justify-center">
              <span
                className="text-base-content/30 text-3xl"
                aria-hidden="true">
                &#10022;
              </span>
              <span className="badge badge-accent absolute top-2 left-2">
                New
              </span>
            </figure>
            <div className="card-body gap-1 p-3">
              <p className="text-base-content/50 text-xs">{product.category}</p>
              <h3 className="text-sm font-medium">{product.name}</h3>
              <p className="text-sm font-semibold">
                ${product.price.toFixed(2)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
