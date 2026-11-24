import type { FC } from 'react';

interface GalleryGridItem {
  src: string;
  alt: string;
  caption?: string;
}

interface GalleryGridProps {
  items: GalleryGridItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const GRID: Record<NonNullable<GalleryGridProps['columns']>, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
};

export const GalleryGrid: FC<GalleryGridProps> = ({
  items,
  columns = 3,
  className = '',
}) => (
  <div className={`grid grid-cols-1 gap-3 ${GRID[columns]} ${className}`}>
    {items.map((item) => (
      <figure
        key={item.src}
        className="group bg-base-200 relative overflow-hidden rounded-xl">
        <img
          src={item.src}
          alt={item.alt}
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {item.caption && (
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pt-8 pb-2 text-left text-xs font-medium text-white">
            {item.caption}
          </figcaption>
        )}
      </figure>
    ))}
  </div>
);
