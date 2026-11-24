import type { FC } from 'react';

interface TrendingItem {
  id: string;
  title: string;
  count?: string;
  href?: string;
}

interface TrendingListProps {
  items: TrendingItem[];
  title?: string;
}

export const TrendingList: FC<TrendingListProps> = ({
  items,
  title = 'Trending',
}) => (
  <section
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="trending-list">
    <div className="card-body gap-4">
      <h2 className="card-title text-base">{title}</h2>
      {items.length === 0 ? (
        <p className="text-base-content/50 text-sm">Nothing trending yet.</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={item.id} className="flex items-start gap-3">
              <span className="text-primary/70 font-mono text-lg font-light">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                {item.href ? (
                  <a
                    href={item.href}
                    className="link link-hover text-sm font-medium">
                    {item.title}
                  </a>
                ) : (
                  <h3 className="text-sm font-medium">{item.title}</h3>
                )}
                {item.count && (
                  <span className="text-base-content/50 text-xs">
                    {item.count}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  </section>
);
