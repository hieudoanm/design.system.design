'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
}

interface InboxViewProps {
  emails: EmailSummary[];
}

export const InboxView: FC<InboxViewProps> = ({ emails }) => {
  const [selectedId, setSelectedId] = useState<string | null>(
    emails[0]?.id ?? null
  );
  const selected = emails.find((email) => email.id === selectedId) ?? null;

  return (
    <div
      className="border-base-content/10 bg-base-200 grid h-[32rem] w-full grid-cols-1 overflow-hidden rounded-xl border lg:grid-cols-2"
      data-testid="inbox-view">
      <section className="border-base-content/10 overflow-y-auto border-b lg:border-r">
        <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
          <h3 className="text-sm font-medium">Inbox</h3>
          <span className="badge badge-ghost badge-sm">{emails.length}</span>
        </header>
        <ul className="flex flex-col">
          {emails.map((email) => (
            <li key={email.id}>
              <button
                type="button"
                onClick={() => setSelectedId(email.id)}
                className={`hover:bg-base-300/60 flex w-full flex-col gap-0.5 px-4 py-3 text-left ${
                  email.id === selectedId ? 'bg-base-300/70' : ''
                }`}>
                <span className="flex items-center gap-2">
                  {email.unread && (
                    <span className="bg-primary h-1.5 w-1.5 rounded-full" />
                  )}
                  <span className="text-sm font-medium">{email.from}</span>
                  <span className="text-base-content/40 ml-auto text-xs">
                    {email.time}
                  </span>
                </span>
                <span className="text-sm">{email.subject}</span>
                <span className="text-base-content/50 text-xs">
                  {email.preview}
                </span>
              </button>
            </li>
          ))}
          {emails.length === 0 && (
            <li className="text-base-content/40 p-4 text-center text-sm">
              Inbox is empty
            </li>
          )}
        </ul>
      </section>
      <section className="flex flex-col p-4">
        {selected ? (
          <div className="flex h-full flex-col gap-2">
            <p className="text-base-content/50 text-xs">{selected.time}</p>
            <h4 className="text-lg font-medium">{selected.subject}</h4>
            <p className="text-sm font-medium">{selected.from}</p>
            <div className="border-base-content/10 mt-2 border-t pt-3">
              <p className="text-sm">{selected.preview}</p>
            </div>
          </div>
        ) : (
          <p className="text-base-content/40 m-auto text-sm">
            Select an email to read
          </p>
        )}
      </section>
    </div>
  );
};

InboxView.displayName = 'InboxView';
