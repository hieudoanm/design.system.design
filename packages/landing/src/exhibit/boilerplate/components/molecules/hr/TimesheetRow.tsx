import type { FC } from 'react';

interface TimesheetRowProps {
  day: string;
  project: string;
  hours: number;
  overtime?: number;
  status: 'pending' | 'approved' | 'rejected';
  className?: string;
}

const statusBadge: Record<TimesheetRowProps['status'], string> = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
};

export const TimesheetRow: FC<TimesheetRowProps> = ({
  day,
  project,
  hours,
  overtime = 0,
  status,
  className = '',
}) => {
  const total = hours + overtime;

  return (
    <div
      data-testid="timesheet-row"
      className={`bg-base-200 border-base-content/10 flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-sm ${className}`}>
      <div className="flex min-w-0 flex-col">
        <span className="font-medium">{day}</span>
        <span className="text-base-content/50 text-xs">{project}</span>
      </div>
      <div className="text-base-content/70 flex items-center gap-2">
        <span>
          {hours}h{overtime > 0 && ` + ${overtime}h OT`}
        </span>
        <span className="text-base-content/50">= {total}h</span>
      </div>
      <span className={`badge ${statusBadge[status]} badge-sm`}>{status}</span>
    </div>
  );
};
