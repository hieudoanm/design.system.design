import type { FC } from 'react';

interface TimesheetEntry {
  id: string;
  week: string;
  project: string;
  hours: number;
  billable: boolean;
  status: 'approved' | 'pending';
}

interface TimesheetDashboardProps {
  entries: TimesheetEntry[];
}

export const TimesheetDashboard: FC<TimesheetDashboardProps> = ({
  entries,
}) => {
  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0);
  const billableHours = entries
    .filter((entry) => entry.billable)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const pending = entries.filter((entry) => entry.status === 'pending').length;

  return (
    <div
      className="flex w-full flex-col gap-4"
      data-testid="timesheet-dashboard">
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Total hours</p>
            <p className="text-2xl font-semibold">{totalHours.toFixed(1)}</p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Billable</p>
            <p className="text-success text-2xl font-semibold">
              {billableHours.toFixed(1)}
            </p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Pending</p>
            <p className="text-warning text-2xl font-semibold">{pending}</p>
          </div>
        </div>
      </div>
      <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
        <table className="table-compact table">
          <thead>
            <tr>
              <th>Week</th>
              <th>Project</th>
              <th>Hours</th>
              <th>Type</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{entry.week}</td>
                <td className="font-medium">{entry.project}</td>
                <td>{entry.hours.toFixed(1)}</td>
                <td>
                  <span
                    className={`badge badge-sm ${
                      entry.billable ? 'badge-info' : 'badge-ghost'
                    }`}>
                    {entry.billable ? 'billable' : 'non-billable'}
                  </span>
                </td>
                <td>
                  <span
                    className={`badge badge-sm ${
                      entry.status === 'approved'
                        ? 'badge-success'
                        : 'badge-warning'
                    }`}>
                    {entry.status}
                  </span>
                </td>
              </tr>
            ))}
            {entries.length === 0 && (
              <tr>
                <td colSpan={5} className="text-base-content/40 text-center">
                  No timesheet entries
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

TimesheetDashboard.displayName = 'TimesheetDashboard';
