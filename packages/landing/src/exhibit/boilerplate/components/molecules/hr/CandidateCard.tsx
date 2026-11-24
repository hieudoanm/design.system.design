import type { FC } from 'react';

interface CandidateCardProps {
  name: string;
  position: string;
  stage: string;
  score?: number;
  appliedAt?: string;
  location?: string;
  className?: string;
}

export const CandidateCard: FC<CandidateCardProps> = ({
  name,
  position,
  stage,
  score,
  appliedAt,
  location,
  className = '',
}) => {
  return (
    <article
      data-testid="candidate-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-medium">{name}</h3>
        <span className="badge badge-info badge-sm">{stage}</span>
      </div>
      <p className="text-base-content/70 text-sm">{position}</p>
      <div className="mt-3 flex items-center justify-between text-xs">
        <div className="text-base-content/50 flex flex-col gap-0.5">
          {location && <span>{location}</span>}
          {appliedAt && <span>Applied {appliedAt}</span>}
        </div>
        {score !== undefined && (
          <span className="badge badge-outline badge-sm">{score}/100</span>
        )}
      </div>
    </article>
  );
};
