import type { FC } from 'react';

interface CategoryCardProps {
  name: string;
  productCount?: number;
  imageLabel?: string;
}

export const CategoryCard: FC<CategoryCardProps> = ({
  name,
  productCount,
  imageLabel = 'Category',
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="category-card">
    <figure className="bg-base-200 flex h-24 items-center justify-center">
      <span className="text-base-content/60 text-sm tracking-widest uppercase">
        {imageLabel}
      </span>
    </figure>
    <div className="card-body gap-1 p-4">
      <h3 className="card-title text-sm">{name}</h3>
      {productCount !== undefined && (
        <p
          className="text-base-content/60 text-xs"
          data-testid="category-count">
          {productCount} products
        </p>
      )}
    </div>
  </div>
);
