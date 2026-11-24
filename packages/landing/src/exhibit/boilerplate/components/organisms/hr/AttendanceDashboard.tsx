import type { FC } from 'react';

interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  checkIn: string;
  checkOut: string;
  hours: number;
  status: 'present' | 'late' | 'absent';
}

interface AttendanceDashboardProps {
  records: AttendanceRecord[];
}

const statusClass: Record<AttendanceRecord['status'], string> = {
  present: 'badge-success',
  late: 'badge-warning',
  absent: 'badge-error',
};

export const AttendanceDashboard: FC<AttendanceDashboardProps> = ({
  records,
}) => {
  const present = records.filter((r) => r.status === 'present').length;
  const late = records.filter((r) => r.status === 'late').length;
  const totalHours = records.reduce((sum, r) => sum + r.hours, 0);

  return (
    <div
      className="flex w-full flex-col gap-4"
      data-testid="attendance-dashboard">
      <div className="grid grid-cols-3 gap-3">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Present</p>
            <p className="text-success text-2xl font-semibold">{present}</p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Late</p>
            <p className="text-warning text-2xl font-semibold">{late}</p>
          </div>
        </div>
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body">
            <p className="text-base-content/50 text-sm">Total hours</p>
            <p className="text-2xl font-semibold">{totalHours.toFixed(1)}</p>
          </div>
        </div>
      </div>
      <div className="border-base-content/10 bg-base-200 overflow-x-auto rounded-xl border">
        <table className="table-compact table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Date</th>
              <th>Check in</th>
              <th>Check out</th>
              <th>Hours</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td className="font-medium">{record.name}</td>
                <td>{record.date}</td>
                <td>{record.checkIn}</td>
                <td>{record.checkOut}</td>
                <td>{record.hours.toFixed(1)}</td>
                <td>
                  <span
                    className={`badge badge-sm ${statusClass[record.status]}`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr>
                <td colSpan={6} className="text-base-content/40 text-center">
                  No attendance records
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

AttendanceDashboard.displayName = 'AttendanceDashboard';
