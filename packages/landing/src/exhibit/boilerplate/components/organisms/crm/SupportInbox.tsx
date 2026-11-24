import type { FC } from 'react';

interface Ticket {
  id: string;
  subject: string;
  customer?: string;
  priority?: 'high' | 'normal' | 'low';
  status?: 'open' | 'pending' | 'resolved';
  updated?: string;
}

interface SupportInboxProps {
  tickets: Ticket[];
  title?: string;
}

const priorityClass: Record<string, string> = {
  high: 'badge-error',
  normal: 'badge-warning',
  low: 'badge-success',
};

const statusClass: Record<string, string> = {
  open: 'badge-info',
  pending: 'badge-warning',
  resolved: 'badge-success',
};

export const SupportInbox: FC<SupportInboxProps> = ({
  tickets,
  title = 'Support inbox',
}) => (
  <section className="py-4">
    <header className="mb-3 flex items-center justify-between">
      <h2 className="text-xl">{title}</h2>
      <span className="badge badge-ghost">{tickets.length} tickets</span>
    </header>
    <ul className="bg-base-200 border-base-content/10 flex flex-col rounded-xl border">
      {tickets.length === 0 && (
        <li className="text-base-content/50 p-4 text-sm">Inbox empty.</li>
      )}
      {tickets.map((ticket) => (
        <li
          key={ticket.id}
          className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
          <div className="flex-1">
            <h3 className="text-sm font-medium">{ticket.subject}</h3>
            {ticket.customer && (
              <p className="text-base-content/50 text-xs">{ticket.customer}</p>
            )}
          </div>
          {ticket.priority && (
            <span
              className={`badge badge-sm ${
                priorityClass[ticket.priority] ?? 'badge-ghost'
              }`}>
              {ticket.priority}
            </span>
          )}
          {ticket.status && (
            <span
              className={`badge badge-sm ${
                statusClass[ticket.status] ?? 'badge-ghost'
              }`}>
              {ticket.status}
            </span>
          )}
          {ticket.updated && (
            <time className="text-base-content/40 text-xs">
              {ticket.updated}
            </time>
          )}
        </li>
      ))}
    </ul>
  </section>
);
