import type { FC } from 'react';

interface AnalysisCardProps {
  title: string;
  author?: string;
  time?: string;
  summary?: string;
  tags?: string[];
  href?: string;
}

export const AnalysisCard: FC<AnalysisCardProps> = ({
  title,
  author,
  time,
  summary,
  tags = [],
  href,
}) => (
  <article
    className="card card-bordered border-primary/30 bg-base-200"
    data-testid="analysis-card">
    <div className="card-body gap-2">
      <span className="badge badge-outline badge-primary badge-xs w-fit">
        Analysis
      </span>
      {href ? (
        <a href={href} className="link link-hover card-title text-base">
          {title}
        </a>
      ) : (
        <h3 className="card-title text-base">{title}</h3>
      )}
      {summary && <p className="text-base-content/70 text-sm">{summary}</p>}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-ghost badge-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}
      {(author || time) && (
        <footer className="text-base-content/50 flex items-center gap-2 text-xs">
          {author && <span>{author}</span>}
          {author && time && <span aria-hidden>·</span>}
          {time && <span>{time}</span>}
        </footer>
      )}
    </div>
  </article>
);
