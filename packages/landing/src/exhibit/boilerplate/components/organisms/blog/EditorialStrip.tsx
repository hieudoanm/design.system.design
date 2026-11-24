import type { FC } from 'react';

interface Editorial {
  id: string;
  title: string;
  description?: string;
  category?: string;
}

interface EditorialStripProps {
  items: Editorial[];
  title?: string;
}

export const EditorialStrip: FC<EditorialStripProps> = ({
  items,
  title = 'Editorial picks',
}) => (
  <section className="py-6">
    <h2 className="mb-4 text-xl">{title}</h2>
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, index) => (
        <article
          key={item.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <span className="text-primary text-2xl font-light">
              {String(index + 1).padStart(2, '0')}
            </span>
            {item.category && (
              <span className="badge badge-ghost badge-sm w-fit">
                {item.category}
              </span>
            )}
            <h3 className="card-title text-base">{item.title}</h3>
            {item.description && (
              <p className="text-base-content/50 text-sm">{item.description}</p>
            )}
          </div>
        </article>
      ))}
    </div>
  </section>
);
