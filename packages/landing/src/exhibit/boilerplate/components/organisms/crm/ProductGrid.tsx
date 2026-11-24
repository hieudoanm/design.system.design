import type { FC, ReactNode } from 'react';

interface ProductItem {
  id: string;
  name: string;
  price: string;
  description?: string;
  rating?: number;
  badge?: string;
  action?: ReactNode;
}

interface ProductGridProps {
  items: ProductItem[];
  title?: string;
  columns?: 2 | 3 | 4;
  className?: string;
}

const columnsClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export const ProductGrid: FC<ProductGridProps> = ({
  items,
  title,
  columns = 3,
  className = '',
}) => (
  <section className={`flex w-full flex-col gap-4 ${className}`}>
    {title && <h2 className="text-xl font-semibold">{title}</h2>}
    <div className={`grid grid-cols-1 ${columnsClass[columns]} gap-4`}>
      {items.map((item) => (
        <article
          key={item.id}
          className="card bg-base-200 border-base-content/10 border">
          <div className="card-body gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="card-title text-base">{item.name}</h3>
              {item.badge && (
                <span className="badge badge-primary">{item.badge}</span>
              )}
            </div>
            {item.description && (
              <p className="text-base-content/60 text-sm">{item.description}</p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-semibold">{item.price}</span>
              {item.rating !== undefined && (
                <span className="text-base-content/50 text-xs">
                  ★ {item.rating}
                </span>
              )}
            </div>
            {item.action && (
              <div className="card-actions mt-1">{item.action}</div>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);

ProductGrid.displayName = 'ProductGrid';
