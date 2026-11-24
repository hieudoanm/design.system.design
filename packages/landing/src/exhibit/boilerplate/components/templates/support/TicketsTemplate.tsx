'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiZap } from 'react-icons/fi';

type TicketPriority = 'Low' | 'Medium' | 'High';
type TicketStatus = 'Open' | 'Pending' | 'Resolved' | 'Closed';
type TicketFilter = 'All' | TicketStatus;

interface Ticket {
  id: string;
  subject: string;
  priority: TicketPriority;
  status: TicketStatus;
}

const TICKETS: Ticket[] = [
  {
    id: 'T-1001',
    subject: 'Cannot reset password',
    priority: 'High',
    status: 'Open',
  },
  {
    id: 'T-1002',
    subject: 'Billing question',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: 'T-1003',
    subject: 'Feature request',
    priority: 'Low',
    status: 'Pending',
  },
  {
    id: 'T-1004',
    subject: 'Login issue on mobile',
    priority: 'High',
    status: 'Resolved',
  },
  {
    id: 'T-1005',
    subject: 'Refund status',
    priority: 'Medium',
    status: 'Closed',
  },
  {
    id: 'T-1006',
    subject: 'API 429 errors',
    priority: 'Low',
    status: 'Closed',
  },
];

const FILTERS: TicketFilter[] = [
  'All',
  'Open',
  'Pending',
  'Resolved',
  'Closed',
];

const getPriorityBadge = (priority: TicketPriority) => {
  switch (priority) {
    case 'High':
      return <span className="badge badge-error badge-sm">High</span>;
    case 'Medium':
      return <span className="badge badge-warning badge-sm">Medium</span>;
    default:
      return <span className="badge badge-neutral badge-sm">Low</span>;
  }
};

const getStatusBadge = (status: TicketStatus) => {
  switch (status) {
    case 'Open':
      return <span className="badge badge-info badge-sm">Open</span>;
    case 'Pending':
      return <span className="badge badge-warning badge-sm">Pending</span>;
    case 'Resolved':
      return <span className="badge badge-success badge-sm">Resolved</span>;
    default:
      return <span className="badge badge-neutral badge-sm">Closed</span>;
  }
};

export const TicketsTemplate: FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [filter, setFilter] = useState<TicketFilter>('All');

  const visible = tickets.filter(
    (ticket) => filter === 'All' || ticket.status === filter
  );

  const claim = (id: string) => {
    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === id ? { ...ticket, status: 'Pending' } : ticket
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Track and manage support requests.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="tabs tabs-boxed tabs-sm w-fit">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`tab ${filter === item ? 'tab-active' : ''}`}>
                {item}
              </button>
            ))}
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} tickets
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {ticket.id}
                      </td>
                      <td className="px-4 py-3 text-sm">{ticket.subject}</td>
                      <td className="px-4 py-3">
                        {getPriorityBadge(ticket.priority)}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-4 py-3">
                        {ticket.status === 'Open' && (
                          <button
                            onClick={() => claim(ticket.id)}
                            className="btn btn-ghost btn-xs gap-1">
                            <FiZap />
                            Claim
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TicketsTemplate.displayName = 'TicketsTemplate';
