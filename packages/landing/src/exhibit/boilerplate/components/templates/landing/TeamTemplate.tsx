'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiCheck } from 'react-icons/fi';

interface Member {
  id: string;
  name: string;
  role: string;
  department: string;
}

const DEPARTMENTS = ['All', 'Engineering', 'Design', 'Leadership'];

const MEMBERS: Member[] = [
  { id: 'm1', name: 'Ada Lovelace', role: 'CTO', department: 'Leadership' },
  {
    id: 'm2',
    name: 'Linus Torvalds',
    role: 'Principal Engineer',
    department: 'Engineering',
  },
  {
    id: 'm3',
    name: 'Grace Hopper',
    role: 'Staff Engineer',
    department: 'Engineering',
  },
  { id: 'm4', name: 'Don Norman', role: 'Design Lead', department: 'Design' },
  {
    id: 'm5',
    name: 'John Ousterhout',
    role: 'Frontend Engineer',
    department: 'Engineering',
  },
  {
    id: 'm6',
    name: 'Margaret Hamilton',
    role: 'Product Designer',
    department: 'Design',
  },
];

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();

export const TeamTemplate: FC = () => {
  const [department, setDepartment] = useState('All');
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const filtered = MEMBERS.filter(
    (member) => department === 'All' || member.department === department
  );

  const connect = (id: string) =>
    setConnectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Boilerplate
        </Link>
        <nav className="flex items-center gap-2">
          <Link href="/auth/sign-in" className="btn btn-ghost btn-sm">
            Sign in
          </Link>
          <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
            Sign up
          </Link>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-24">
        <span className="badge badge-neutral mb-6 rounded-full">Team</span>
        <h1 className="mb-4 text-4xl md:text-5xl">Meet the team</h1>
        <p className="text-base-content/60 mb-10 text-sm">
          {filtered.length} team members
        </p>

        <div className="tabs tabs-boxed tabs-sm mb-8 w-fit">
          {DEPARTMENTS.map((item) => (
            <button
              key={item}
              onClick={() => setDepartment(item)}
              className={`tab ${department === item ? 'tab-active' : ''}`}>
              {item}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member) => {
            const connected = connectedIds.includes(member.id);
            return (
              <div
                key={member.id}
                className="card border-base-content/10 bg-base-200 border">
                <div className="card-body items-center p-6 text-center">
                  <div className="bg-primary/10 text-primary flex h-14 w-14 items-center justify-center rounded-full text-lg font-semibold">
                    {initials(member.name)}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-base-content/50 text-xs">
                      {member.role}
                    </p>
                  </div>
                  {connected ? (
                    <span className="badge badge-success badge-sm gap-1">
                      <FiCheck className="h-3 w-3" />
                      Connected
                    </span>
                  ) : (
                    <button
                      onClick={() => connect(member.id)}
                      className="btn btn-primary btn-sm">
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="border-base-300 border-t px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-base-content/50 text-xs">
            &copy; {new Date().getFullYear()} Boilerplate. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/landing/privacy"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Privacy
            </Link>
            <Link
              href="/landing/terms"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Terms
            </Link>
            <Link
              href="/landing/contact"
              className="text-base-content/50 hover:text-base-content text-xs transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

TeamTemplate.displayName = 'TeamTemplate';
