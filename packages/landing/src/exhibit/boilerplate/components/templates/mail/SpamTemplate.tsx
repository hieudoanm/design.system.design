'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface SpamMessage {
  id: string;
  from: string;
  subject: string;
}

const SPAM: SpamMessage[] = [
  { id: 'sp1', from: 'Lottery Winner', subject: 'You have won a prize!' },
  { id: 'sp2', from: 'Cheap Deals', subject: 'Limited time offers' },
  { id: 'sp3', from: 'Crypto News', subject: 'Massive returns guaranteed' },
  { id: 'sp4', from: 'Mystery Shopper', subject: 'Claim your reward' },
];

export const SpamTemplate: FC = () => {
  const [spam, setSpam] = useState<SpamMessage[]>(SPAM);

  const removeSpam = (id: string) => {
    setSpam((prev) => prev.filter((message) => message.id !== id));
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Spam</h1>
        <p className="text-base-content/50 mt-1 text-sm">Flagged messages.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {spam.length} spam messages
        </p>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            {spam.length === 0 ? (
              <p className="text-base-content/50 p-5 text-sm">
                No spam messages
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-base-content/40 border-base-content/10 border-b text-left text-xs tracking-wider uppercase">
                      <th className="px-4 py-3 font-medium">From</th>
                      <th className="px-4 py-3 font-medium">Subject</th>
                      <th className="px-4 py-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spam.map((message) => (
                      <tr
                        key={message.id}
                        className="border-base-content/10 border-b">
                        <td className="px-4 py-3 text-sm font-medium">
                          {message.from}
                        </td>
                        <td className="px-4 py-3 text-sm">{message.subject}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => removeSpam(message.id)}
                            className="btn btn-ghost btn-xs">
                            Not spam
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

SpamTemplate.displayName = 'SpamTemplate';
