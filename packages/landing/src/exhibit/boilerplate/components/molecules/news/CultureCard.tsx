import type { FC } from 'react';

interface CultureCardProps {
  title: string;
  category?: string;
  author?: string;
  date?: string;
  excerpt?: string;
  href?: string;
}

export const CultureCard: FC<CultureCardProps> = ({
  title,
  category = 'Culture',
  author,
  date,
  excerpt,
  href,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="culture-card">
    <div className="card-body gap-2">
      <div className="flex items-center gap-2">
        <span className="badge badge-accent badge-xs">{category}</span>
        {date && <span className="text-base-content/50 text-xs">{date}</span>}
      </div>
      {href ? (
        <a href={href} className="link link-hover card-title text-base">
          {title}
        </a>
      ) : (
        <h3 className="card-title text-base">{title}</h3>
      )}
      {excerpt && <p className="text-base-content/70 text-sm">{excerpt}</p>}
      {author && (
        <footer className="text-base-content/50 text-xs">{author}</footer>
      )}
    </div>
  </article>
);
