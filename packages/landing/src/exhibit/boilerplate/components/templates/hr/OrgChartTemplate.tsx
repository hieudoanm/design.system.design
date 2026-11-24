'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiGrid } from 'react-icons/fi';

interface Department {
  id: string;
  name: string;
  head: string;
  members: string[];
}

const DEPARTMENTS: Department[] = [
  {
    id: 'd1',
    name: 'Engineering',
    head: 'Priya Patel',
    members: ['Sofia Rossi', 'David Chen', 'Ana Garcia'],
  },
  {
    id: 'd2',
    name: 'Design',
    head: 'Lena Kim',
    members: ['Maya Singh', 'Noah Weber', 'Emma Silva'],
  },
  {
    id: 'd3',
    name: 'Marketing',
    head: 'Omar Haddad',
    members: ['Tom Baker', 'Zoe Lee', 'Liam Brown', 'Nina Costa'],
  },
];

export const OrgChartTemplate: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Org Chart</h1>
        <p className="text-base-content/50 mt-1 text-sm">Company structure.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiGrid />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Departments</p>
              <p className="text-2xl font-bold tracking-tight">
                {DEPARTMENTS.length} departments
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {DEPARTMENTS.map((department) => (
            <div
              key={department.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{department.name}</p>
                    <p className="text-base-content/50 mt-0.5 text-xs">
                      Head: {department.head}
                    </p>
                  </div>
                  <button
                    onClick={() => toggle(department.id)}
                    className="btn btn-ghost btn-xs shrink-0">
                    {expandedId === department.id ? 'Hide team' : 'Show team'}
                  </button>
                </div>
                {expandedId === department.id && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {department.members.map((member) => (
                      <span key={member} className="badge badge-ghost badge-sm">
                        {member}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

OrgChartTemplate.displayName = 'OrgChartTemplate';
