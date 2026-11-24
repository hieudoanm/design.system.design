import type { FC } from 'react';

interface Category {
  id: string;
  name: string;
  count: number;
  description?: string;
}

interface CategorySectionProps {
  categories: Category[];
  title?: string;
}

export const CategorySection: FC<CategorySectionProps> = ({
  categories,
  title = 'Browse by category',
}) => (
  <section className="py-6">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => (
        <article
          key={category.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <h3 className="card-title text-base">{category.name}</h3>
              <span className="badge badge-primary badge-sm">
                {category.count}
              </span>
            </div>
            {category.description && (
              <p className="text-base-content/50 text-sm">
                {category.description}
              </p>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);
