import type { FC } from 'react';

interface AttendanceRow {
  date: string;
  checkIn?: string;
  checkOut?: string;
  hours: number;
  status: 'present' | 'late' | 'absent' | 'leave';
}

interface AttendanceTableProps {
  rows: AttendanceRow[];
  className?: string;
}

const statusBadge: Record<AttendanceRow['status'], string> = {
  present: 'badge-success',
  late: 'badge-warning',
  absent: 'badge-error',
  leave: 'badge-info',
};

export const AttendanceTable: FC<AttendanceTableProps> = ({
  rows,
  className = '',
}) => {
  return (
    <div
      data-testid="attendance-table"
      className={`overflow-x-auto ${className}`}>
      <table className="table-zebra table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Check in</th>
            <th>Check out</th>
            <th>Hours</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-base-content/50 text-center">
                No attendance records
              </td>
            </tr>
          ) : (
            rows.map((row, index) => (
              <tr key={`${row.date}-${index}`}>
                <td>{row.date}</td>
                <td>{row.checkIn ?? '—'}</td>
                <td>{row.checkOut ?? '—'}</td>
                <td>{row.hours}h</td>
                <td>
                  <span className={`badge ${statusBadge[row.status]} badge-sm`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
