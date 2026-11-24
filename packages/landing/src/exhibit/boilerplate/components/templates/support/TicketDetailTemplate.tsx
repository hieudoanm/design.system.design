'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiSend } from 'react-icons/fi';

type TicketStatus = 'Open' | 'Resolved';

interface Message {
  author: string;
  text: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  messages: Message[];
}

const TICKET: Ticket = {
  id: 'T-1001',
  subject: 'Cannot reset password',
  status: 'Open',
  messages: [
    { author: 'Jane Doe', text: 'I cannot reset my password.' },
    { author: 'You', text: 'Hi Jane, let me look into that.' },
    { author: 'Jane Doe', text: 'It says link expired.' },
  ],
};

export const TicketDetailTemplate: FC = () => {
  const [status, setStatus] = useState<TicketStatus>(TICKET.status);
  const [messages, setMessages] = useState<Message[]>(TICKET.messages);
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { author: 'You', text }]);
    setDraft('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Ticket Detail</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Customer conversation and resolution.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {messages.length} messages
        </p>

        <div className="card bg-base-200 border-base-content/10 mb-4 border">
          <div className="card-body p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-base-content/50 text-xs">{TICKET.id}</p>
                <h2 className="text-lg font-semibold">{TICKET.subject}</h2>
              </div>
              {status === 'Open' ? (
                <span className="badge badge-warning badge-sm">Open</span>
              ) : (
                <span className="badge badge-success badge-sm">Resolved</span>
              )}
            </div>
            {status === 'Open' && (
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setStatus('Resolved')}
                  className="btn btn-primary btn-sm gap-1">
                  <FiCheck />
                  Resolve ticket
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 mb-4 border">
          <div className="card-body flex flex-col gap-2 p-5">
            {messages.map((msg, index) => (
              <p key={index} className="text-sm">
                {msg.author}: {msg.text}
              </p>
            ))}
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body flex flex-col gap-3 p-5">
            <textarea
              aria-label="Reply to customer"
              placeholder="Write a reply..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="textarea textarea-bordered textarea-sm w-full"
            />
            <div className="flex justify-end">
              <button onClick={send} className="btn btn-primary btn-sm gap-1">
                <FiSend />
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

TicketDetailTemplate.displayName = 'TicketDetailTemplate';
