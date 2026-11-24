import type { FC } from 'react';

interface EditorialCardProps {
  title: string;
  author?: string;
  date?: string;
  excerpt?: string;
  stance?: 'support' | 'oppose' | 'neutral';
  href?: string;
}

const stanceBadge: Record<NonNullable<EditorialCardProps['stance']>, string> = {
  support: 'badge-success',
  oppose: 'badge-error',
  neutral: 'badge-ghost',
};

export const EditorialCard: FC<EditorialCardProps> = ({
  title,
  author,
  date,
  excerpt,
  stance = 'neutral',
  href,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="editorial-card">
    <div className="card-body gap-2">
      <div className="flex items-center gap-2">
        <span className="badge badge-primary badge-xs">Editorial</span>
        <span className={`badge badge-xs ${stanceBadge[stance]}`}>
          {stance}
        </span>
      </div>
      {href ? (
        <a href={href} className="link link-hover card-title text-base">
          {title}
        </a>
      ) : (
        <h3 className="card-title text-base">{title}</h3>
      )}
      {excerpt && <p className="text-base-content/70 text-sm">{excerpt}</p>}
      {(author || date) && (
        <footer className="text-base-content/50 flex items-center gap-2 text-xs">
          {author && <span>{author}</span>}
          {author && date && <span aria-hidden>·</span>}
          {date && <span>{date}</span>}
        </footer>
      )}
    </div>
  </article>
);
