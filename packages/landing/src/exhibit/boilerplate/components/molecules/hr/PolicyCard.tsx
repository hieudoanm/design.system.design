import type { FC } from 'react';

interface PolicyCardProps {
  title: string;
  summary?: string;
  version?: string;
  updatedAt?: string;
  category?: string;
  className?: string;
}

export const PolicyCard: FC<PolicyCardProps> = ({
  title,
  summary,
  version,
  updatedAt,
  category,
  className = '',
}) => {
  return (
    <article
      data-testid="policy-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        {category && (
          <span className="badge badge-outline badge-sm">{category}</span>
        )}
      </div>
      {summary && (
        <p className="text-base-content/70 mt-2 text-sm">{summary}</p>
      )}
      <div className="text-base-content/50 mt-3 flex items-center justify-between text-xs">
        <span>{version ? `v${version}` : 'Latest'}</span>
        {updatedAt && <span>Updated {updatedAt}</span>}
      </div>
    </article>
  );
};
