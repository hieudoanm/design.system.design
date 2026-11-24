import type { FC } from 'react';

interface LeaveRequest {
  employee: string;
  type: string;
  from: string;
  to: string;
  days?: number;
  status: 'pending' | 'approved' | 'rejected';
  reason?: string;
}

interface LeaveCardProps {
  leave: LeaveRequest;
  className?: string;
}

const statusBadge: Record<LeaveRequest['status'], string> = {
  pending: 'badge-warning',
  approved: 'badge-success',
  rejected: 'badge-error',
};

export const LeaveCard: FC<LeaveCardProps> = ({ leave, className = '' }) => {
  const { employee, type, from, to, days, status, reason } = leave;

  return (
    <article
      data-testid="leave-card"
      className={`card bg-base-200 border-base-content/10 border p-5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-medium">{employee}</h3>
        <span className={`badge ${statusBadge[status]} badge-sm`}>
          {status}
        </span>
      </div>
      <dl className="mt-3 flex flex-col gap-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-base-content/50">Type</dt>
          <dd className="font-medium">{type}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/50">From</dt>
          <dd>{from}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-base-content/50">To</dt>
          <dd>{to}</dd>
        </div>
        {days !== undefined && (
          <div className="flex justify-between">
            <dt className="text-base-content/50">Days</dt>
            <dd>{days}</dd>
          </div>
        )}
      </dl>
      {reason && (
        <p className="text-base-content/70 border-base-content/10 mt-3 border-t pt-3 text-sm">
          {reason}
        </p>
      )}
    </article>
  );
};
