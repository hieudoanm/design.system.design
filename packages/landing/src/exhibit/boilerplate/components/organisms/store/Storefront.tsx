import type { FC } from 'react';

interface Category {
  id: string;
  name: string;
}

interface FeaturedProduct {
  id: string;
  name: string;
  price: number;
}

interface StorefrontProps {
  title: string;
  subtitle?: string;
  categories: Category[];
  products: FeaturedProduct[];
}

export const Storefront: FC<StorefrontProps> = ({
  title,
  subtitle,
  categories,
  products,
}) => {
  return (
    <section data-testid="storefront" className="flex flex-col gap-6">
      <div className="hero bg-base-200 rounded-2xl">
        <div className="hero-content flex-col py-10 text-center">
          <h1 className="text-2xl font-medium">{title}</h1>
          {subtitle && <p className="text-base-content/60">{subtitle}</p>}
          <button type="button" className="btn btn-primary mt-2">
            Shop now
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Browse categories</h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              className="btn btn-outline btn-sm">
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Featured products</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <article key={product.id} className="card bg-base-200">
              <figure className="bg-secondary/20 flex aspect-square items-center justify-center">
                <span
                  className="text-base-content/30 text-3xl"
                  aria-hidden="true">
                  &#9632;
                </span>
              </figure>
              <div className="card-body gap-1 p-3">
                <h3 className="text-sm font-medium">{product.name}</h3>
                <p className="text-sm font-semibold">
                  ${product.price.toFixed(2)}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
