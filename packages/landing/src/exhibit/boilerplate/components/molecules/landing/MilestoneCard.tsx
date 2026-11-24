import type { FC } from 'react';

interface MilestoneCardProps {
  year: string;
  title: string;
  description?: string;
  category?: string;
  className?: string;
}

export const MilestoneCard: FC<MilestoneCardProps> = ({
  year,
  title,
  description,
  category,
  className = '',
}) => {
  return (
    <article
      data-testid="milestone-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-primary text-sm font-semibold">{year}</span>
        {category && (
          <span className="badge badge-outline badge-sm">{category}</span>
        )}
      </div>
      <h3 className="mt-3 text-base font-medium">{title}</h3>
      {description && (
        <p className="text-base-content/70 mt-2 text-sm leading-relaxed">
          {description}
        </p>
      )}
    </article>
  );
};
