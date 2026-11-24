import type { FC } from 'react';

interface ArticleCardProps {
  title: string;
  category?: string;
  author?: string;
  date?: string;
  excerpt?: string;
  href?: string;
}

export const ArticleCard: FC<ArticleCardProps> = ({
  title,
  category,
  author,
  date,
  excerpt,
  href,
}) => (
  <article className="card card-bordered border-base-300 bg-base-200">
    <div className="card-body gap-2">
      {category && (
        <span className="badge badge-ghost badge-xs w-fit">{category}</span>
      )}
      <h3 className="card-title text-base">{title}</h3>
      {excerpt && <p className="text-base-content/70 text-sm">{excerpt}</p>}
      {(author || date) && (
        <footer className="text-base-content/50 flex items-center gap-2 text-xs">
          {author && <span>{author}</span>}
          {author && date && <span aria-hidden>·</span>}
          {date && <span>{date}</span>}
        </footer>
      )}
      {href && (
        <a href={href} className="link link-primary text-sm">
          Read more
        </a>
      )}
    </div>
  </article>
);
