'use client';

import type { FC } from 'react';
import { useState } from 'react';

type LeadStatus = 'New' | 'Contacted' | 'Qualified';
type LeadFilter = 'All' | LeadStatus;

interface Lead {
  id: string;
  name: string;
  company: string;
  source: string;
  status: LeadStatus;
}

const LEADS: Lead[] = [
  {
    id: 'l1',
    name: 'Alice Chen',
    company: 'Acme Corp',
    source: 'Website',
    status: 'New',
  },
  {
    id: 'l2',
    name: 'Bob Martinez',
    company: 'Northwind',
    source: 'Referral',
    status: 'New',
  },
  {
    id: 'l3',
    name: 'Carol Smith',
    company: 'Vertex Systems',
    source: 'Webinar',
    status: 'Contacted',
  },
  {
    id: 'l4',
    name: 'David Lee',
    company: 'Blue Sky Media',
    source: 'LinkedIn',
    status: 'Contacted',
  },
  {
    id: 'l5',
    name: 'Emma Wilson',
    company: 'Acme Corp',
    source: 'Website',
    status: 'Qualified',
  },
  {
    id: 'l6',
    name: 'Frank Moore',
    company: 'Northwind',
    source: 'Event',
    status: 'Qualified',
  },
];

const FILTERS: LeadFilter[] = ['All', 'New', 'Contacted', 'Qualified'];

const getStatusBadge = (status: LeadStatus) => {
  switch (status) {
    case 'New':
      return <span className="badge badge-info badge-sm">New</span>;
    case 'Contacted':
      return <span className="badge badge-warning badge-sm">Contacted</span>;
    default:
      return <span className="badge badge-success badge-sm">Qualified</span>;
  }
};

export const LeadsTemplate: FC = () => {
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [filter, setFilter] = useState<LeadFilter>('All');

  const visible = leads.filter(
    (lead) => filter === 'All' || lead.status === filter
  );

  const markContacted = (id: string) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === id ? { ...lead, status: 'Contacted' } : lead
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Inbound sales leads.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          <p className="text-base-content/50 text-sm">{visible.length} leads</p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Company</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((lead) => (
                    <tr
                      key={lead.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {lead.name}
                      </td>
                      <td className="px-4 py-3 text-sm">{lead.company}</td>
                      <td className="px-4 py-3 text-sm">{lead.source}</td>
                      <td className="px-4 py-3">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-4 py-3">
                        {lead.status === 'New' && (
                          <button
                            type="button"
                            onClick={() => markContacted(lead.id)}
                            className="btn btn-ghost btn-xs">
                            Mark contacted
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

LeadsTemplate.displayName = 'LeadsTemplate';
