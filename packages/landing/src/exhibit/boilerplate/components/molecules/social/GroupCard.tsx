import type { FC } from 'react';

interface GroupCardProps {
  name: string;
  members: number;
  description?: string;
  category?: string;
}

export const GroupCard: FC<GroupCardProps> = ({
  name,
  members,
  description,
  category,
}) => (
  <article
    className="card card-bordered border-base-300 bg-base-200"
    data-testid="group-card">
    <div className="card-body gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="card-title text-base">{name}</h3>
        {category && (
          <span className="badge badge-ghost badge-xs">{category}</span>
        )}
      </div>
      {description && (
        <p className="text-base-content/70 text-sm">{description}</p>
      )}
      <p className="text-base-content/50 text-xs">{members} members</p>
    </div>
  </article>
);
