import type { FC } from 'react';

interface BreakingNewsProps {
  headline: string;
  tag?: string;
  href?: string;
  live?: boolean;
}

export const BreakingNews: FC<BreakingNewsProps> = ({
  headline,
  tag = 'Breaking',
  href,
  live = false,
}) => (
  <div
    role="status"
    className="alert alert-error flex-wrap gap-3 rounded-xl shadow-sm"
    data-testid="breaking-news">
    <span className="badge gap-1 border-0">
      {live && <span className="loading loading-dots loading-xs" aria-hidden />}
      {tag}
    </span>
    {href ? (
      <a href={href} className="link link-hover font-semibold">
        {headline}
      </a>
    ) : (
      <span className="font-semibold">{headline}</span>
    )}
  </div>
);
