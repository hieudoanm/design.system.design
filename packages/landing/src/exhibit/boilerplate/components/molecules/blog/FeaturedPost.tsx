import type { FC } from 'react';

interface FeaturedPostProps {
  title: string;
  excerpt: string;
  author: string;
  readTime: string;
  imageSrc?: string;
  href?: string;
  category?: string;
}

export const FeaturedPost: FC<FeaturedPostProps> = ({
  title,
  excerpt,
  author,
  readTime,
  imageSrc,
  href = '#',
  category,
}) => (
  <article
    data-testid="featured-post"
    className="card card-side bg-base-100 flex-col shadow-lg lg:flex-row">
    {imageSrc && (
      <figure className="bg-base-200 aspect-video overflow-hidden lg:w-1/2">
        <img src={imageSrc} alt="" className="h-full w-full object-cover" />
      </figure>
    )}
    <div className="card-body justify-between">
      <div className="flex flex-col gap-2">
        {category && (
          <div className="badge badge-accent badge-sm w-fit">{category}</div>
        )}
        <h2 className="card-title text-2xl">{title}</h2>
        <p className="text-base-content/70">{excerpt}</p>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-base-content/50 text-sm">
          <span>{author}</span>
          <span> · {readTime}</span>
        </div>
        <a href={href} className="btn btn-primary btn-sm">
          Read article
        </a>
      </div>
    </div>
  </article>
);

FeaturedPost.displayName = 'FeaturedPost';
