'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Account {
  id: string;
  name: string;
  industry: string;
  contacts: string[];
}

const ACCOUNTS: Account[] = [
  {
    id: 'a1',
    name: 'Acme Corp',
    industry: 'Technology',
    contacts: ['Ada Lovelace', 'Grace Hopper'],
  },
  {
    id: 'a2',
    name: 'Northwind Traders',
    industry: 'Retail',
    contacts: ['Alice Chen', 'Bob Martinez', 'Carol Smith'],
  },
  {
    id: 'a3',
    name: 'Vertex Systems',
    industry: 'Manufacturing',
    contacts: ['David Lee', 'Emma Wilson'],
  },
  {
    id: 'a4',
    name: 'Blue Sky Media',
    industry: 'Media',
    contacts: ['Frank Moore', 'Grace Kim', 'Hannah Brown'],
  },
];

export const AccountsTemplate: FC = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Accounts</h1>
        <p className="text-base-content/50 mt-1 text-sm">Customer accounts.</p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <p className="text-base-content/50 mb-6 text-sm">
          {ACCOUNTS.length} accounts
        </p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {ACCOUNTS.map((account) => (
            <div
              key={account.id}
              className="card bg-base-200 border-base-content/10 border">
              <div className="card-body p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="badge badge-ghost badge-sm">
                        {account.industry}
                      </span>
                      <span className="text-base-content/50 text-xs">
                        {account.contacts.length} contacts
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(
                        expandedId === account.id ? null : account.id
                      )
                    }
                    className="btn btn-ghost btn-xs gap-1">
                    {expandedId === account.id ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                    {expandedId === account.id
                      ? 'Hide contacts'
                      : 'Show contacts'}
                  </button>
                </div>
                {expandedId === account.id && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {account.contacts.map((contact) => (
                      <span
                        key={contact}
                        className="badge badge-outline badge-sm">
                        {contact}
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

AccountsTemplate.displayName = 'AccountsTemplate';
