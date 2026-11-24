'use client';

import type { FC, FormEvent } from 'react';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

export const ComposeTemplate: FC = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!to.trim()) {
      setError('Enter a recipient');
      setSent(false);
      return;
    }
    setTo('');
    setSubject('');
    setBody('');
    setError(null);
    setSent(true);
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Compose</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Write a new message.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="recipient@example.com"
                  aria-label="To"
                  className="input input-bordered input-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  aria-label="Subject"
                  className="input input-bordered input-sm"
                />
              </div>
              <div className="flex flex-col gap-1">
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  aria-label="Body"
                  rows={6}
                  className="textarea textarea-bordered"
                />
              </div>
              <div className="flex items-center justify-between gap-3">
                <button type="submit" className="btn btn-primary btn-sm gap-1">
                  <FiSend />
                  Send
                </button>
                {body && (
                  <p className="text-base-content/50 text-sm">Draft saved</p>
                )}
              </div>
              {error && (
                <p className="text-error text-sm" role="alert">
                  {error}
                </p>
              )}
              {sent && <p className="text-success text-sm">Message sent</p>}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

ComposeTemplate.displayName = 'ComposeTemplate';
