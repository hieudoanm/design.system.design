import type { FC, ReactNode } from 'react';

interface ShowcaseItem {
  id: string;
  title: string;
  description?: string;
  image?: string;
  cta?: ReactNode;
}

interface ShowcaseSectionProps {
  title?: string;
  items: ShowcaseItem[];
  columns?: 2 | 3;
  className?: string;
}

const columnsClass: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
};

export const ShowcaseSection: FC<ShowcaseSectionProps> = ({
  title,
  items,
  columns = 3,
  className = '',
}) => (
  <section className={`flex w-full flex-col gap-4 ${className}`}>
    {title && <h2 className="text-xl font-semibold">{title}</h2>}
    <div className={`grid grid-cols-1 ${columnsClass[columns]} gap-4`}>
      {items.map((item) => (
        <article
          key={item.id}
          className="card bg-base-200 border-base-content/10 overflow-hidden border">
          {item.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.title}
              className="aspect-video w-full object-cover"
            />
          ) : (
            <div className="bg-base-300 text-base-content/30 flex aspect-video w-full items-center justify-center">
              {item.title}
            </div>
          )}
          <div className="card-body gap-1 p-4">
            <h3 className="card-title text-base">{item.title}</h3>
            {item.description && (
              <p className="text-base-content/60 text-sm">{item.description}</p>
            )}
            {item.cta && <div className="card-actions mt-2">{item.cta}</div>}
          </div>
        </article>
      ))}
    </div>
  </section>
);

ShowcaseSection.displayName = 'ShowcaseSection';
