import type { FC } from 'react';

interface FeaturedStoryProps {
  title: string;
  excerpt?: string;
  author?: string;
  date?: string;
  category?: string;
  readTime?: string;
}

export const FeaturedStory: FC<FeaturedStoryProps> = ({
  title,
  excerpt,
  author,
  date,
  category,
  readTime,
}) => (
  <article
    data-testid="featured-story"
    className="card bg-base-200 border-base-content/10 overflow-hidden rounded-xl border">
    <div className="from-primary to-secondary h-48 w-full bg-gradient-to-br" />
    <div className="card-body">
      {category && (
        <span className="badge badge-primary badge-sm w-fit">{category}</span>
      )}
      <h2 className="text-2xl">{title}</h2>
      {excerpt && <p className="text-base-content/60">{excerpt}</p>}
      <div className="text-base-content/50 mt-2 flex items-center gap-3 text-sm">
        {author && <span>{author}</span>}
        {date && <time>{date}</time>}
        {readTime && <span>{readTime}</span>}
      </div>
    </div>
  </article>
);
