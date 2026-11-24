import type { FC } from 'react';

interface HeadlineRowProps {
  title: string;
  section?: string;
  time?: string;
  href?: string;
  rank?: number;
}

export const HeadlineRow: FC<HeadlineRowProps> = ({
  title,
  section,
  time,
  href,
  rank,
}) => (
  <div
    className="border-base-300 flex items-start gap-3 border-b py-3"
    data-testid="headline-row">
    {rank !== undefined && (
      <span className="text-base-content/40 font-mono text-lg font-light">
        {rank}
      </span>
    )}
    <div className="min-w-0 flex-1">
      {href ? (
        <a href={href} className="link link-hover leading-snug font-medium">
          {title}
        </a>
      ) : (
        <h3 className="text-sm leading-snug font-medium">{title}</h3>
      )}
      {(section || time) && (
        <div className="text-base-content/50 mt-1 flex items-center gap-2 text-xs">
          {section && (
            <span className="badge badge-ghost badge-xs">{section}</span>
          )}
          {time && <time>{time}</time>}
        </div>
      )}
    </div>
  </div>
);
