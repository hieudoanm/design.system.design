import type { FC } from 'react';

interface AwardCardProps {
  title: string;
  organization: string;
  year: string;
  description?: string;
  className?: string;
}

export const AwardCard: FC<AwardCardProps> = ({
  title,
  organization,
  year,
  description,
  className = '',
}) => {
  return (
    <article
      data-testid="award-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <span aria-hidden="true" className="text-warning text-2xl">
          🏆
        </span>
        <span className="badge badge-outline badge-sm">{year}</span>
      </div>
      <h3 className="mt-3 text-base font-medium">{title}</h3>
      <p className="text-base-content/70 text-sm">{organization}</p>
      {description && (
        <p className="text-base-content/50 mt-2 text-sm leading-relaxed">
          {description}
        </p>
      )}
    </article>
  );
};
