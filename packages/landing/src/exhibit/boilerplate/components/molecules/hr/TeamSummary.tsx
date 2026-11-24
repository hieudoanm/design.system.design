import type { FC } from 'react';

interface TeamSummaryProps {
  name: string;
  size: number;
  openRoles: number;
  location?: string;
  manager?: string;
  className?: string;
}

export const TeamSummary: FC<TeamSummaryProps> = ({
  name,
  size,
  openRoles,
  location,
  manager,
  className = '',
}) => {
  return (
    <div
      data-testid="team-summary"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{name}</h3>
        {openRoles > 0 && (
          <span className="badge badge-secondary badge-sm">
            {openRoles} openings
          </span>
        )}
      </div>
      {location && <p className="text-base-content/70 text-sm">{location}</p>}
      <div className="mt-3 flex items-end gap-1">
        <span className="text-2xl font-semibold">{size}</span>
        <span className="text-base-content/50 mb-1 text-xs">members</span>
      </div>
      {manager && (
        <p className="text-base-content/50 border-base-content/10 mt-2 border-t pt-2 text-xs">
          Manager: {manager}
        </p>
      )}
    </div>
  );
};
