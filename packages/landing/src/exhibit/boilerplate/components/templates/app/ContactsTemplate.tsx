'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSearch, FiStar } from 'react-icons/fi';

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  favorited: boolean;
}

const INITIAL_CONTACTS: Contact[] = [
  {
    id: 'c1',
    name: 'Alice Chen',
    email: 'alice@acme.com',
    company: 'Acme Inc',
    favorited: false,
  },
  {
    id: 'c2',
    name: 'Bob Martinez',
    email: 'bob@globex.com',
    company: 'Globex Corp',
    favorited: true,
  },
  {
    id: 'c3',
    name: 'Carol Smith',
    email: 'carol@initech.com',
    company: 'Initech',
    favorited: false,
  },
  {
    id: 'c4',
    name: 'David Kim',
    email: 'david@umbrella.com',
    company: 'Umbrella',
    favorited: false,
  },
];

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase();

export const ContactsTemplate: FC = () => {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const visible = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(query) ||
      contact.email.toLowerCase().includes(query) ||
      contact.company.toLowerCase().includes(query)
  );

  const toggleFavorite = (id: string) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id
          ? { ...contact, favorited: !contact.favorited }
          : contact
      )
    );
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Keep track of the people you work with.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="relative mb-4 w-full max-w-xs">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="input input-bordered input-sm bg-base-200 w-full pl-9"
          />
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {visible.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-10">
                <FiSearch className="text-base-content/30 h-8 w-8" />
                <p className="text-base-content/50 text-sm">
                  No contacts found
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                      <th className="px-4 py-3 font-medium">Contact</th>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((contact) => (
                      <tr
                        key={contact.id}
                        className="border-base-content/10 border-b">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-base-300 flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium">
                              {getInitials(contact.name)}
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {contact.name}
                              </p>
                              <p className="text-base-content/40 text-xs">
                                {contact.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{contact.company}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => toggleFavorite(contact.id)}
                            aria-label={`Toggle favorite for ${contact.name}`}
                            className={`btn btn-ghost btn-xs ${
                              contact.favorited
                                ? 'text-amber-500'
                                : 'text-base-content/50'
                            }`}>
                            <FiStar />
                            {contact.favorited ? 'Favorited' : 'Favorite'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

ContactsTemplate.displayName = 'ContactsTemplate';
