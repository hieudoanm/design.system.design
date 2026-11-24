import type { FC } from 'react';

type LeadStatusValue =
  'new' | 'contacted' | 'qualified' | 'proposal' | 'won' | 'lost';

interface LeadStatusProps {
  status: LeadStatusValue;
}

const statusClass: Record<LeadStatusValue, string> = {
  new: 'badge-info',
  contacted: 'badge-primary',
  qualified: 'badge-accent',
  proposal: 'badge-warning',
  won: 'badge-success',
  lost: 'badge-error',
};

const statusLabel: Record<LeadStatusValue, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  proposal: 'Proposal',
  won: 'Won',
  lost: 'Lost',
};

export const LeadStatus: FC<LeadStatusProps> = ({ status }) => (
  <span
    data-testid="lead-status"
    className={`badge badge-outline ${statusClass[status]}`}>
    {statusLabel[status]}
  </span>
);
