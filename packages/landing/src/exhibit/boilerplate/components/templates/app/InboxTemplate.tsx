'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiInbox, FiMail, FiSearch, FiTrash2 } from 'react-icons/fi';

interface Message {
  id: string;
  sender: string;
  subject: string;
  time: string;
  unread: boolean;
  from: string;
  to: string;
  body: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'Alice Chen',
    subject: 'Q3 planning',
    time: '10:24',
    unread: true,
    from: 'alice@acme.com',
    to: 'me@acme.com',
    body: 'Can you review the roadmap before our call?',
  },
  {
    id: 'm2',
    sender: 'GitHub',
    subject: 'Build passed',
    time: '09:12',
    unread: true,
    from: 'github@notify.com',
    to: 'me@acme.com',
    body: 'CI pipeline finished successfully for main.',
  },
  {
    id: 'm3',
    sender: 'Stripe',
    subject: 'Payment received',
    time: 'Yesterday',
    unread: false,
    from: 'billing@stripe.com',
    to: 'me@acme.com',
    body: 'We received your payment of $49.00.',
  },
];

export const InboxTemplate: FC = () => {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const query = search.trim().toLowerCase();
  const filtered = messages.filter((message) =>
    `${message.sender} ${message.subject}`.toLowerCase().includes(query)
  );
  const selected =
    messages.find((message) => message.id === selectedId) ?? null;

  const markAsRead = (id: string) => {
    setMessages((prev) =>
      prev.map((message) =>
        message.id === id ? { ...message, unread: false } : message
      )
    );
  };

  const deleteMessage = (id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
    setSelectedId(null);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Read and manage your messages in one place.
        </p>
      </header>

      <main className="mx-auto w-full max-w-5xl p-6">
        <div className="relative mb-4">
          <FiSearch className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mail..."
            className="input input-bordered input-sm bg-base-200 w-full max-w-xs pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-0">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10">
                  <FiInbox className="text-base-content/30 h-8 w-8" />
                  <p className="text-base-content/50 text-sm">No messages</p>
                </div>
              ) : (
                <ul className="divide-base-content/10 flex flex-col divide-y">
                  {filtered.map((message) => (
                    <li key={message.id}>
                      <button
                        onClick={() => setSelectedId(message.id)}
                        aria-label={`Open message from ${message.sender}`}
                        className="hover:bg-base-300/50 flex w-full items-center gap-3 px-4 py-3 text-left">
                        {message.unread && (
                          <span
                            title="Unread"
                            className="bg-primary h-2 w-2 shrink-0 rounded-full"
                          />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold">
                            {message.sender}
                          </p>
                          <p className="text-base-content/60 truncate text-xs">
                            {message.subject}
                          </p>
                        </div>
                        <span className="text-base-content/40 shrink-0 text-xs">
                          {message.time}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="card bg-base-200 border-base-content/10 border">
            <div className="card-body p-5">
              {selected === null ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center">
                  <FiMail className="text-base-content/30 h-8 w-8" />
                  <p className="text-base-content/50 text-sm">
                    No message selected
                  </p>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold">
                      {selected.subject}
                    </h3>
                    <p className="text-base-content/50 text-xs">
                      From {selected.from} to {selected.to}
                    </p>
                  </div>
                  <p className="mb-4 text-sm leading-relaxed">
                    {selected.body}
                  </p>
                  <div className="flex gap-2">
                    {selected.unread && (
                      <button
                        onClick={() => markAsRead(selected.id)}
                        className="btn btn-primary btn-sm">
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      className="btn btn-ghost btn-sm hover:text-error">
                      <FiTrash2 />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

InboxTemplate.displayName = 'InboxTemplate';
