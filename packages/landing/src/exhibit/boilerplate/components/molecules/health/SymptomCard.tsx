import type { FC } from 'react';

type Severity = 'mild' | 'moderate' | 'severe';

interface SymptomCardProps {
  name: string;
  severity: Severity;
  duration?: string;
  note?: string;
  date?: string;
}

const severityBadges: Record<Severity, string> = {
  mild: 'badge-success',
  moderate: 'badge-warning',
  severe: 'badge-error',
};

export const SymptomCard: FC<SymptomCardProps> = ({
  name,
  severity,
  duration,
  note,
  date,
}) => (
  <div className="card bg-base-100 w-full shadow" data-testid="symptom-card">
    <div className="card-body gap-2">
      <div className="flex items-center justify-between">
        <h3 className="card-title text-base">{name}</h3>
        <span className={`badge ${severityBadges[severity]}`}>{severity}</span>
      </div>
      {duration && (
        <p className="text-base-content/60 text-sm">Duration: {duration}</p>
      )}
      {note && <p className="text-base-content/60 text-sm">{note}</p>}
      {date && <p className="text-base-content/50 text-xs">{date}</p>}
    </div>
  </div>
);
