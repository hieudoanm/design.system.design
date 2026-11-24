import type { FC } from 'react';

interface LocalItem {
  title: string;
  city: string;
  time: string;
  excerpt: string;
}

interface LocalNewsProps {
  items: LocalItem[];
  title?: string;
}

export const LocalNews: FC<LocalNewsProps> = ({
  items,
  title = 'Local News',
}) => (
  <section data-testid="local-news" className="flex w-full flex-col gap-4">
    <h2>{title}</h2>
    <ul className="flex w-full flex-col gap-3">
      {items.map((item, index) => (
        <li
          key={index}
          className="card bg-base-200 border-base-content/10 rounded-xl border p-4">
          <div className="flex items-center gap-2">
            <span className="badge badge-accent badge-sm w-fit">
              {item.city}
            </span>
            <time className="text-base-content/50 text-xs">{item.time}</time>
          </div>
          <h3 className="mt-2">{item.title}</h3>
          <p className="text-base-content/60 text-sm">{item.excerpt}</p>
        </li>
      ))}
    </ul>
  </section>
);
