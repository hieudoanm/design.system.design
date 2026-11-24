'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface CategoryItem {
  label: string;
  count?: number;
}

interface CategoryListProps {
  categories: CategoryItem[];
  active?: string;
  onSelect?: (label: string) => void;
}

export const CategoryList: FC<CategoryListProps> = ({
  categories,
  active,
  onSelect,
}) => {
  const [selected, setSelected] = useState(active ?? '');

  return (
    <nav
      data-testid="category-list"
      aria-label="Categories"
      className="flex flex-wrap gap-2">
      {categories.map((category) => (
        <button
          key={category.label}
          type="button"
          onClick={() => {
            setSelected(category.label);
            onSelect?.(category.label);
          }}
          className={`badge badge-lg ${
            selected === category.label ? 'badge-primary' : 'badge-ghost'
          }`}>
          {category.label}
          {category.count !== undefined && (
            <span className="opacity-60">{category.count}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

CategoryList.displayName = 'CategoryList';
