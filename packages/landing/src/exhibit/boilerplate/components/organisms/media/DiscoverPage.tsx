import type { FC } from 'react';

interface DiscoverItem {
  id: string;
  title: string;
  subtitle: string;
  type: string;
}

interface DiscoverPageProps {
  items: DiscoverItem[];
  title?: string;
  onOpen?: (id: string) => void;
}

export const DiscoverPage: FC<DiscoverPageProps> = ({
  items,
  title = 'Discover',
  onOpen,
}) => {
  return (
    <section data-testid="discover-page" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">{title}</h2>
        <input
          type="search"
          className="input input-bordered input-sm w-48"
          placeholder="Search media..."
          aria-label="Search media"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article key={item.id} className="card bg-base-200">
            <div className="card-body gap-1 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="badge badge-outline badge-sm">
                  {item.type}
                </span>
              </div>
              <h3 className="text-sm font-medium">{item.title}</h3>
              <p className="text-base-content/50 text-xs">{item.subtitle}</p>
              <button
                type="button"
                className="btn btn-ghost btn-xs mt-2 self-start"
                onClick={() => onOpen?.(item.id)}>
                Open
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
