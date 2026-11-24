import type { FC } from 'react';

interface SupportTicketProps {
  id: string;
  subject: string;
  customer: string;
  priority: 'Low' | 'Medium' | 'High';
  status: string;
  date: string;
}

const priorityBadge: Record<SupportTicketProps['priority'], string> = {
  Low: 'badge-ghost',
  Medium: 'badge-warning',
  High: 'badge-error',
};

export const SupportTicket: FC<SupportTicketProps> = ({
  id,
  subject,
  customer,
  priority,
  status,
  date,
}) => (
  <article data-testid="support-ticket" className="card bg-base-100 shadow-sm">
    <div className="card-body flex-row items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="card-title text-base">{subject}</h3>
          <span className={`badge badge-sm ${priorityBadge[priority]}`}>
            {priority}
          </span>
        </div>
        <p className="text-base-content/60 text-sm">
          {customer} · {date}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="badge badge-ghost badge-sm">{status}</span>
        <span className="text-base-content/40 text-xs">#{id}</span>
      </div>
    </div>
  </article>
);

SupportTicket.displayName = 'SupportTicket';
