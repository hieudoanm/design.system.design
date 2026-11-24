'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface Message {
  id: string;
  from: string;
  subject: string;
  time: string;
  unread: boolean;
}

type Filter = 'All' | 'Unread';

const MESSAGES: Message[] = [
  {
    id: 'm1',
    from: 'GitHub',
    subject: 'Build passed',
    time: '10:24',
    unread: true,
  },
  {
    id: 'm2',
    from: 'Stripe',
    subject: 'Payment received',
    time: '09:12',
    unread: true,
  },
  {
    id: 'm3',
    from: 'Acme',
    subject: 'Q3 planning',
    time: '08:45',
    unread: true,
  },
  {
    id: 'm4',
    from: 'Design Weekly',
    subject: 'This week in design',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'm5',
    from: 'Team Sync',
    subject: 'Standup notes',
    time: 'Yesterday',
    unread: false,
  },
  {
    id: 'm6',
    from: 'Recruiter',
    subject: 'Senior role opportunity',
    time: 'Monday',
    unread: false,
  },
];

const FILTERS: Filter[] = ['All', 'Unread'];

export const InboxTemplate: FC = () => {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [filter, setFilter] = useState<Filter>('All');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const visible = messages.filter(
    (message) => filter === 'All' || message.unread
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const deleteSelected = () => {
    setMessages((prev) =>
      prev.filter((message) => !selectedIds.includes(message.id))
    );
    setSelectedIds([]);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-base-content/50 mt-1 text-sm">Your messages.</p>
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
          <div className="flex items-center gap-3">
            <p className="text-base-content/50 text-sm">
              {visible.length} messages
            </p>
            <button
              onClick={deleteSelected}
              disabled={selectedIds.length === 0}
              className="btn btn-ghost btn-xs gap-1">
              <FiTrash2 />
              Delete selected ({selectedIds.length})
            </button>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <ul className="divide-base-content/10 flex flex-col divide-y">
              {visible.map((message) => (
                <li
                  key={message.id}
                  className="flex items-center gap-3 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(message.id)}
                    onChange={() => toggleSelect(message.id)}
                    aria-label={`Select ${message.subject}`}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{message.from}</p>
                    <p className="text-base-content/60 truncate text-xs">
                      {message.subject}
                    </p>
                  </div>
                  <span className="text-base-content/40 shrink-0 text-xs">
                    {message.time}
                  </span>
                  {message.unread ? (
                    <span className="badge badge-info badge-sm">Unread</span>
                  ) : (
                    <span className="badge badge-ghost badge-sm">Read</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

InboxTemplate.displayName = 'InboxTemplate';
