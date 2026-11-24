'use client';

import type { FC } from 'react';
import { useState } from 'react';

type Team = 'Sales' | 'Marketing' | 'Engineering';
type TeamFilter = 'All' | Team;

interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  team: Team;
}

const CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Alice Chen',
    company: 'Acme Corp',
    role: 'Sales Manager',
    team: 'Sales',
  },
  {
    id: 'c2',
    name: 'Bob Martinez',
    company: 'Northwind',
    role: 'Account Executive',
    team: 'Sales',
  },
  {
    id: 'c3',
    name: 'Carol Smith',
    company: 'Vertex Systems',
    role: 'Growth Lead',
    team: 'Marketing',
  },
  {
    id: 'c4',
    name: 'David Lee',
    company: 'Blue Sky Media',
    role: 'Field Engineer',
    team: 'Engineering',
  },
  {
    id: 'c5',
    name: 'Emma Wilson',
    company: 'Acme Corp',
    role: 'Product Designer',
    team: 'Engineering',
  },
  {
    id: 'c6',
    name: 'Frank Moore',
    company: 'Northwind',
    role: 'Content Writer',
    team: 'Marketing',
  },
  {
    id: 'c7',
    name: 'Grace Kim',
    company: 'Vertex Systems',
    role: 'VP Sales',
    team: 'Sales',
  },
];

const FILTERS: TeamFilter[] = ['All', 'Sales', 'Marketing', 'Engineering'];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

const getTeamBadge = (team: Team) => {
  switch (team) {
    case 'Sales':
      return <span className="badge badge-info badge-sm">Sales</span>;
    case 'Marketing':
      return <span className="badge badge-warning badge-sm">Marketing</span>;
    default:
      return <span className="badge badge-success badge-sm">Engineering</span>;
  }
};

export const CrmContactsTemplate: FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TeamFilter>('All');

  const query = search.trim().toLowerCase();

  const visible = CONTACTS.filter((contact) => {
    const matchesTeam = filter === 'All' || contact.team === filter;
    const matchesQuery =
      query === '' || contact.name.toLowerCase().includes(query);
    return matchesTeam && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Everyone you do business with.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts..."
              aria-label="Search contacts"
              className="input input-bordered input-sm sm:max-w-xs"
            />
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
          </div>
          <p className="text-base-content/50 text-sm">
            {visible.length} contacts
          </p>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {visible.length === 0 ? (
              <p className="text-base-content/50 px-4 py-6 text-sm">
                No contacts found
              </p>
            ) : (
              visible.map((contact) => (
                <div
                  key={contact.id}
                  className="border-base-content/10 flex items-center gap-3 border-b p-4 last:border-b-0">
                  <div className="bg-base-300 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium">
                    {getInitials(contact.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{contact.name}</p>
                    <p className="text-base-content/50 text-xs">
                      {contact.role} at {contact.company}
                    </p>
                  </div>
                  {getTeamBadge(contact.team)}
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

CrmContactsTemplate.displayName = 'CrmContactsTemplate';
