import type { FC } from 'react';

interface EntertainmentItem {
  title: string;
  type: string;
  time: string;
  imageAlt: string;
}

interface EntertainmentFeedProps {
  items: EntertainmentItem[];
  title?: string;
}

const typeClass: Record<string, string> = {
  Movies: 'badge-warning',
  Music: 'badge-secondary',
  Celebrities: 'badge-accent',
};

export const EntertainmentFeed: FC<EntertainmentFeedProps> = ({
  items,
  title = 'Entertainment',
}) => (
  <section
    data-testid="entertainment-feed"
    className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <article
          key={index}
          className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
          <div
            role="img"
            aria-label={item.imageAlt}
            className="from-warning to-secondary h-36 w-full bg-gradient-to-br"
          />
          <div className="card-body">
            <div className="flex items-center justify-between">
              <span
                className={`badge badge-sm ${typeClass[item.type] ?? 'badge-ghost'}`}>
                {item.type}
              </span>
              <span className="text-base-content/50 text-xs">{item.time}</span>
            </div>
            <h3 className="card-title">{item.title}</h3>
          </div>
        </article>
      ))}
    </div>
  </section>
);
