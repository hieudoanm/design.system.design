import type { FC } from 'react';

interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface CategoryShowcaseProps {
  categories: Category[];
  onSelect?: (id: string) => void;
}

export const CategoryShowcase: FC<CategoryShowcaseProps> = ({
  categories,
  onSelect,
}) => {
  return (
    <section data-testid="category-showcase" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Shop by category</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="card bg-base-200 hover:bg-base-100"
            onClick={() => onSelect?.(category.id)}>
            <div className="card-body items-center gap-2 p-4">
              <span className="text-3xl" aria-hidden="true">
                {category.icon}
              </span>
              <h3 className="text-sm font-medium">{category.name}</h3>
              <p className="text-base-content/50 text-xs">
                {category.count.toLocaleString()} items
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
