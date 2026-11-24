import type { FC } from 'react';

interface LeaveStatusProps {
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  label?: string;
}

const statusClass: Record<LeaveStatusProps['status'], string> = {
  approved: 'badge-success',
  pending: 'badge-warning',
  rejected: 'badge-error',
  cancelled: 'badge-neutral',
};

export const LeaveStatus: FC<LeaveStatusProps> = ({ status, label }) => {
  const text = label ?? status;
  return (
    <span
      data-testid="leave-status"
      className={`badge badge-sm ${statusClass[status]}`}>
      {text}
    </span>
  );
};
