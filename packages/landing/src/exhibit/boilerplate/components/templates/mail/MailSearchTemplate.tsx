'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';

interface MailItem {
  id: string;
  from: string;
  subject: string;
}

const MAIL: MailItem[] = [
  { id: 'ms1', from: 'GitHub', subject: 'Build passed' },
  { id: 'ms2', from: 'Stripe', subject: 'Payment received' },
  { id: 'ms3', from: 'Acme', subject: 'Q3 planning' },
  { id: 'ms4', from: 'Design Weekly', subject: 'This week in design' },
  { id: 'ms5', from: 'Team Sync', subject: 'Standup notes' },
  { id: 'ms6', from: 'Recruiter', subject: 'Senior role opportunity' },
];

export const MailSearchTemplate: FC = () => {
  const [query, setQuery] = useState('');

  const trimmed = query.trim().toLowerCase();
  const results = MAIL.filter((message) =>
    `${message.from} ${message.subject}`.toLowerCase().includes(trimmed)
  );

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Mail Search</h1>
        <p className="text-base-content/50 mt-1 text-sm">Find any message.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="relative mb-4">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search messages..."
            aria-label="Search mail"
            className="input input-bordered input-sm bg-base-200 w-full max-w-sm pl-9"
          />
        </div>

        <p className="text-base-content/50 mb-4 text-sm">
          {results.length} results
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {results.length === 0 ? (
              <p className="text-base-content/50 p-5 text-sm">
                {`No results for "${query.trim()}"`}
              </p>
            ) : (
              <ul className="divide-base-content/10 flex flex-col divide-y">
                {results.map((message) => (
                  <li key={message.id} className="px-4 py-3">
                    <p className="text-sm">
                      {message.from}: {message.subject}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

MailSearchTemplate.displayName = 'MailSearchTemplate';
