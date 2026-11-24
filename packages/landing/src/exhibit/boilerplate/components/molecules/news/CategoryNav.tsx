'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface CategoryNavProps {
  categories: string[];
  active?: string;
  onSelect?: (category: string) => void;
  ariaLabel?: string;
}

export const CategoryNav: FC<CategoryNavProps> = ({
  categories,
  active,
  onSelect,
  ariaLabel = 'News categories',
}) => {
  const [selected, setSelected] = useState(active ?? categories[0] ?? '');
  const current = active ?? selected;

  return (
    <nav aria-label={ariaLabel} className="w-full" data-testid="category-nav">
      <ul className="menu menu-horizontal menu-sm rounded-box bg-base-200 gap-1 p-1">
        {categories.map((category) => {
          const isActive = category === current;
          return (
            <li key={category}>
              <button
                type="button"
                aria-current={isActive ? 'page' : undefined}
                className={isActive ? 'menu-active' : ''}
                onClick={() => {
                  setSelected(category);
                  onSelect?.(category);
                }}>
                {category}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};
