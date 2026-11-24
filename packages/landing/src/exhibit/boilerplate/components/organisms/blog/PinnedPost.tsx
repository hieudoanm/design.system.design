import type { FC } from 'react';

interface PinnedPostProps {
  title: string;
  excerpt?: string;
  author?: string;
  date?: string;
  tags?: string[];
}

export const PinnedPost: FC<PinnedPostProps> = ({
  title,
  excerpt,
  author,
  date,
  tags = [],
}) => (
  <article
    data-testid="pinned-post"
    className="card bg-primary text-primary-content border-primary rounded-xl border">
    <div className="card-body">
      <div className="flex items-center gap-2">
        <span aria-hidden="true">📌</span>
        <span className="badge badge-outline badge-sm">Pinned</span>
      </div>
      <h2 className="card-title">{title}</h2>
      {excerpt && <p className="text-primary-content/70">{excerpt}</p>}
      <div className="text-primary-content/60 mt-1 flex items-center gap-3 text-sm">
        {author && <span>{author}</span>}
        {date && <time>{date}</time>}
      </div>
      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="badge badge-ghost badge-sm">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  </article>
);
