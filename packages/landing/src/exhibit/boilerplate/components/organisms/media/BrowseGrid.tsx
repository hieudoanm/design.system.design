import type { FC } from 'react';

interface BrowseItem {
  id: string;
  title: string;
  subtitle: string;
}

interface BrowseGridProps {
  items: BrowseItem[];
  title?: string;
}

export const BrowseGrid: FC<BrowseGridProps> = ({
  items,
  title = 'Browse',
}) => {
  return (
    <section data-testid="browse-grid" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <button type="button" className="btn btn-ghost btn-sm">
          View all
        </button>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="card bg-base-200">
            <figure className="bg-primary/20 relative flex aspect-square items-center justify-center">
              <span
                className="text-base-content/30 text-3xl"
                aria-hidden="true">
                &#10024;
              </span>
            </figure>
            <div className="card-body gap-1 p-3">
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-base-content/50 text-xs">{item.subtitle}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
