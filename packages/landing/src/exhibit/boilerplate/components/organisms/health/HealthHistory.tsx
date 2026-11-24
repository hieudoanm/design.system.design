import type { FC } from 'react';

interface HealthRecord {
  id: string;
  date: string;
  type: string;
  provider: string;
  result?: string;
  notes?: string;
}

interface HealthHistoryProps {
  records: HealthRecord[];
  title?: string;
}

export const HealthHistory: FC<HealthHistoryProps> = ({
  records,
  title = 'Health history',
}) => (
  <section className="card bg-base-200 w-full">
    <div className="card-body flex flex-col gap-4">
      <h3 className="card-title">{title}</h3>
      <ol className="border-base-content/20 relative flex flex-col gap-4 border-l pl-6">
        {records.map((record) => (
          <li key={record.id} className="relative">
            <span className="bg-base-content/40 absolute top-1 -left-[29px] h-3 w-3 rounded-full" />
            <div className="bg-base-100 border-base-content/10 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{record.type}</span>
                <span className="text-base-content/50 text-xs">
                  {record.date}
                </span>
              </div>
              <p className="text-base-content/60 text-sm">{record.provider}</p>
              {record.result && (
                <span className="badge badge-ghost badge-sm mt-1">
                  {record.result}
                </span>
              )}
              {record.notes && (
                <p className="text-base-content/60 mt-1 text-sm">
                  {record.notes}
                </p>
              )}
            </div>
          </li>
        ))}
      </ol>
      {records.length === 0 && (
        <p className="text-base-content/40 text-sm" data-testid="empty">
          No health records yet.
        </p>
      )}
    </div>
  </section>
);
