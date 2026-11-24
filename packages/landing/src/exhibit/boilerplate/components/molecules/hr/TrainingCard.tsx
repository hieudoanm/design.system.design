import type { FC } from 'react';

interface TrainingCardProps {
  title: string;
  provider: string;
  date: string;
  duration?: string;
  status: 'upcoming' | 'in-progress' | 'completed';
  category?: string;
  className?: string;
}

const statusBadge: Record<TrainingCardProps['status'], string> = {
  upcoming: 'badge-info',
  'in-progress': 'badge-warning',
  completed: 'badge-success',
};

export const TrainingCard: FC<TrainingCardProps> = ({
  title,
  provider,
  date,
  duration,
  status,
  category,
  className = '',
}) => {
  return (
    <article
      data-testid="training-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{title}</h3>
        <span className={`badge ${statusBadge[status]} badge-sm`}>
          {status}
        </span>
      </div>
      <p className="text-base-content/70 text-sm">{provider}</p>
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <span className="bg-base-100 badge">{date}</span>
        {duration && <span className="bg-base-100 badge">{duration}</span>}
        {category && <span className="bg-base-100 badge">{category}</span>}
      </div>
    </article>
  );
};
