import type { FC, ReactNode } from 'react';

interface MasonryProps {
  items: ReactNode[];
  columns?: 2 | 3 | 4;
  gap?: 'sm' | 'md' | 'lg';
  className?: string;
}

const columnsClass: Record<number, string> = {
  2: 'columns-2',
  3: 'columns-3',
  4: 'columns-4',
};

const gapClass: Record<NonNullable<MasonryProps['gap']>, string> = {
  sm: 'gap-3',
  md: 'gap-4',
  lg: 'gap-6',
};

export const Masonry: FC<MasonryProps> = ({
  items,
  columns = 3,
  gap = 'md',
  className = '',
}) => (
  <div
    className={`w-full ${columnsClass[columns]} ${gapClass[gap]} ${className}`}>
    {items.map((item, index) => (
      <div key={index} className="mb-4 break-inside-avoid">
        {item}
      </div>
    ))}
  </div>
);

Masonry.displayName = 'Masonry';
