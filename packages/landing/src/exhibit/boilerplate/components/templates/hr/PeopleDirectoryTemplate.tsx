'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiUsers } from 'react-icons/fi';

type Department = 'Engineering' | 'Design' | 'Marketing';
type DepartmentFilter = 'All' | Department;

interface Person {
  id: string;
  name: string;
  role: string;
  department: Department;
}

const PEOPLE: Person[] = [
  {
    id: 'p1',
    name: 'Priya Patel',
    role: 'Engineering Lead',
    department: 'Engineering',
  },
  {
    id: 'p2',
    name: 'Sofia Rossi',
    role: 'Software Engineer',
    department: 'Engineering',
  },
  {
    id: 'p3',
    name: 'David Chen',
    role: 'Frontend Engineer',
    department: 'Engineering',
  },
  {
    id: 'p4',
    name: 'Lena Kim',
    role: 'Design Lead',
    department: 'Design',
  },
  {
    id: 'p5',
    name: 'Maya Singh',
    role: 'Product Designer',
    department: 'Design',
  },
  {
    id: 'p6',
    name: 'Omar Haddad',
    role: 'Marketing Lead',
    department: 'Marketing',
  },
  {
    id: 'p7',
    name: 'Tom Baker',
    role: 'Content Strategist',
    department: 'Marketing',
  },
  {
    id: 'p8',
    name: 'Ana Garcia',
    role: 'Backend Engineer',
    department: 'Engineering',
  },
];

const FILTERS: DepartmentFilter[] = [
  'All',
  'Engineering',
  'Design',
  'Marketing',
];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

export const PeopleDirectoryTemplate: FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<DepartmentFilter>('All');

  const query = search.trim().toLowerCase();

  const visible = PEOPLE.filter((person) => {
    const matchesDepartment = filter === 'All' || person.department === filter;
    const matchesQuery =
      query === '' || person.name.toLowerCase().includes(query);
    return matchesDepartment && matchesQuery;
  });

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">People Directory</h1>
        <p className="text-base-content/50 mt-1 text-sm">Find team members.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body flex-row items-center gap-4 p-5">
            <div className="bg-primary/10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl">
              <FiUsers />
            </div>
            <div>
              <p className="text-base-content/50 text-xs">Team</p>
              <p className="text-2xl font-bold tracking-tight">
                {visible.length} employees
              </p>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name..."
            aria-label="Search people"
            className="input input-bordered input-sm w-full sm:max-w-xs"
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

        {visible.length === 0 ? (
          <p className="text-base-content/50 py-10 text-center text-sm">
            No employees found
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((person) => (
              <div
                key={person.id}
                className="card bg-base-200 border-base-content/10 border">
                <div className="card-body p-5">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                      {getInitials(person.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {person.name}
                      </p>
                      <p className="text-base-content/50 truncate text-xs">
                        {person.role}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-ghost badge-sm">
                    {person.department}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

PeopleDirectoryTemplate.displayName = 'PeopleDirectoryTemplate';
