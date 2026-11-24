import type { FC } from 'react';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  date?: string;
  category?: string;
  imageSrc?: string;
  href?: string;
}

export const ArticleCard: FC<ArticleCardProps> = ({
  title,
  excerpt,
  author,
  readTime,
  date,
  category,
  imageSrc,
  href = '#',
}) => (
  <article data-testid="article-card" className="card bg-base-100 shadow-lg">
    {imageSrc && (
      <figure className="bg-base-200 aspect-video overflow-hidden">
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
      </figure>
    )}
    <div className="card-body">
      {category && (
        <div className="badge badge-primary badge-sm w-fit">{category}</div>
      )}
      <h3 className="card-title">{title}</h3>
      <p className="text-base-content/70 text-sm">{excerpt}</p>
      <div className="text-base-content/50 flex items-center gap-2 text-xs">
        <span>{author}</span>
        {date && (
          <>
            <span aria-hidden="true">·</span>
            <span>{date}</span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{readTime}</span>
      </div>
      <div className="card-actions mt-2">
        <a href={href} className="btn btn-primary btn-sm">
          Read more
        </a>
      </div>
    </div>
  </article>
);

ArticleCard.displayName = 'ArticleCard';
