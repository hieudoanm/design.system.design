import type { FC } from 'react';

interface LeadCardProps {
  name: string;
  company?: string;
  email?: string;
  source?: string;
  score?: number;
  status?: 'New' | 'Contacted' | 'Qualified' | 'Lost';
}

const statusBadge: Record<NonNullable<LeadCardProps['status']>, string> = {
  New: 'badge-info',
  Contacted: 'badge-warning',
  Qualified: 'badge-success',
  Lost: 'badge-error',
};

export const LeadCard: FC<LeadCardProps> = ({
  name,
  company,
  email,
  source,
  score = 0,
  status = 'New',
}) => (
  <article data-testid="lead-card" className="card bg-base-100 shadow-sm">
    <div className="card-body">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="card-title">{name}</h3>
          {company && <p className="text-base-content/60 text-sm">{company}</p>}
        </div>
        <div className={`badge ${statusBadge[status]}`}>{status}</div>
      </div>
      {email && (
        <a href={`mailto:${email}`} className="text-primary text-sm">
          {email}
        </a>
      )}
      <div className="text-base-content/50 flex items-center gap-3 text-xs">
        {source && <span>{source}</span>}
        <span>Score: {score}</span>
      </div>
    </div>
  </article>
);

LeadCard.displayName = 'LeadCard';
