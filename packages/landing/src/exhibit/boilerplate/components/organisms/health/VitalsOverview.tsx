import type { FC } from 'react';

interface Vital {
  label: string;
  value: number;
  unit: string;
  status?: 'normal' | 'high' | 'low';
}

interface VitalsOverviewProps {
  vitals: Vital[];
  title?: string;
}

const statusBadge: Record<NonNullable<Vital['status']>, string> = {
  normal: 'badge-success',
  high: 'badge-warning',
  low: 'badge-info',
};

export const VitalsOverview: FC<VitalsOverviewProps> = ({
  vitals,
  title = 'Vitals overview',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-3">
      <h3 className="card-title">{title}</h3>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {vitals.map((vital) => (
          <div key={vital.label} className="bg-base-100 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <p className="text-base-content/50 text-xs">{vital.label}</p>
              {vital.status && (
                <span className={`badge badge-sm ${statusBadge[vital.status]}`}>
                  {vital.status}
                </span>
              )}
            </div>
            <p className="text-2xl font-light">
              {vital.value}{' '}
              <span className="text-base-content/50 text-sm">{vital.unit}</span>
            </p>
          </div>
        ))}
      </div>
      {vitals.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No vitals recorded.
        </p>
      )}
    </div>
  </section>
);
