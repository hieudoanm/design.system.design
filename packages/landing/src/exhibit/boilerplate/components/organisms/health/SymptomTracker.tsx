import type { FC } from 'react';

interface Symptom {
  id: string;
  name: string;
  severity: number;
  date: string;
  notes?: string;
}

interface SymptomTrackerProps {
  symptoms: Symptom[];
  title?: string;
}

const severityBadge = (severity: number): string => {
  if (severity >= 4) return 'badge-error';
  if (severity >= 3) return 'badge-warning';
  return 'badge-success';
};

const severityLabel = (severity: number): string => {
  if (severity >= 4) return 'Severe';
  if (severity >= 3) return 'Moderate';
  if (severity >= 2) return 'Mild';
  return 'Minimal';
};

export const SymptomTracker: FC<SymptomTrackerProps> = ({
  symptoms,
  title = 'Symptom tracker',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <h3 className="card-title">{title}</h3>
      {symptoms.map((symptom) => (
        <article
          key={symptom.id}
          className="bg-base-100 border-base-content/10 flex items-center gap-3 rounded-xl border p-4">
          <div className="flex flex-1 flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{symptom.name}</span>
              <span
                className={`badge badge-sm ${severityBadge(symptom.severity)}`}>
                {severityLabel(symptom.severity)}
              </span>
            </div>
            <span className="text-base-content/50 text-xs">{symptom.date}</span>
            {symptom.notes && (
              <span className="text-base-content/60 mt-1 text-sm">
                {symptom.notes}
              </span>
            )}
          </div>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`h-2 w-4 rounded ${
                  index < symptom.severity ? 'bg-warning' : 'bg-base-300'
                }`}
              />
            ))}
          </div>
        </article>
      ))}
      {symptoms.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No symptoms logged.
        </p>
      )}
    </div>
  </section>
);
