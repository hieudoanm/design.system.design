import type { FC } from 'react';

interface BlogTeaserProps {
  title: string;
  excerpt?: string;
  date: string;
  author: string;
  tags?: string[];
  readTime?: string;
  className?: string;
}

export const BlogTeaser: FC<BlogTeaserProps> = ({
  title,
  excerpt,
  date,
  author,
  tags = [],
  readTime,
  className = '',
}) => {
  return (
    <article
      data-testid="blog-teaser"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="text-base-content/50 flex flex-wrap items-center gap-2 text-xs">
        <span>{date}</span>
        <span aria-hidden="true">·</span>
        <span>{author}</span>
        {readTime && (
          <>
            <span aria-hidden="true">·</span>
            <span>{readTime} read</span>
          </>
        )}
      </div>
      <h3 className="mt-2 text-base font-medium">{title}</h3>
      {excerpt && (
        <p className="text-base-content/70 mt-2 text-sm leading-relaxed">
          {excerpt}
        </p>
      )}
      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tags.map((tag, index) => (
            <span
              key={`${tag}-${index}`}
              className="badge badge-ghost badge-sm">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};
