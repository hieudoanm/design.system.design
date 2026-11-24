'use client';

import type { FC } from 'react';
import { useState } from 'react';

type SentStatus = 'Delivered' | 'Read';

interface SentMessage {
  id: string;
  to: string;
  subject: string;
  status: SentStatus;
}

const SENT: SentMessage[] = [
  {
    id: 's1',
    to: 'alice@acme.com',
    subject: 'Q3 roadmap review',
    status: 'Read',
  },
  {
    id: 's2',
    to: 'bob@acme.com',
    subject: 'Meeting follow-up',
    status: 'Delivered',
  },
  {
    id: 's3',
    to: 'carol@acme.com',
    subject: 'Project kickoff notes',
    status: 'Read',
  },
  {
    id: 's4',
    to: 'dave@acme.com',
    subject: 'Invoice attached',
    status: 'Delivered',
  },
  { id: 's5', to: 'emma@acme.com', subject: 'Welcome aboard', status: 'Read' },
];

export const SentTemplate: FC = () => {
  const [sent] = useState<SentMessage[]>(SENT);

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Sent</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Messages you have sent.
        </p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {sent.length} sent messages
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                    <th className="px-4 py-3 font-medium">To</th>
                    <th className="px-4 py-3 font-medium">Subject</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sent.map((message) => (
                    <tr
                      key={message.id}
                      className="border-base-content/10 border-b">
                      <td className="px-4 py-3 text-sm font-medium">
                        {message.to}
                      </td>
                      <td className="px-4 py-3 text-sm">{message.subject}</td>
                      <td className="px-4 py-3">
                        {message.status === 'Read' ? (
                          <span className="badge badge-info badge-sm">
                            Read
                          </span>
                        ) : (
                          <span className="badge badge-neutral badge-sm">
                            Delivered
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

SentTemplate.displayName = 'SentTemplate';
