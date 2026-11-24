import type { FC } from 'react';

interface PostHeaderProps {
  title: string;
  author: string;
  date: string;
  readTime: string;
  category?: string;
}

export const PostHeader: FC<PostHeaderProps> = ({
  title,
  author,
  date,
  readTime,
  category,
}) => (
  <header data-testid="post-header" className="flex flex-col gap-3">
    {category && (
      <div className="badge badge-secondary badge-sm w-fit">{category}</div>
    )}
    <h1 className="text-3xl font-bold">{title}</h1>
    <div className="text-base-content/60 flex items-center gap-3 text-sm">
      <span>{author}</span>
      <span aria-hidden="true">·</span>
      <time>{date}</time>
      <span aria-hidden="true">·</span>
      <span>{readTime}</span>
    </div>
  </header>
);

PostHeader.displayName = 'PostHeader';
