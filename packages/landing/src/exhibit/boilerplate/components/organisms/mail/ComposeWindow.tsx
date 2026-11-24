'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ComposeWindowProps {
  onSend?: (payload: {
    to: string;
    cc: string;
    subject: string;
    body: string;
  }) => void;
  onDiscard?: () => void;
}

export const ComposeWindow: FC<ComposeWindowProps> = ({
  onSend,
  onDiscard,
}) => {
  const [to, setTo] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const handleSend = (): void => {
    onSend?.({ to, cc, subject, body });
  };

  return (
    <div
      className="border-base-content/10 bg-base-100 flex w-full max-w-2xl flex-col rounded-xl border shadow-lg"
      data-testid="compose-window">
      <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">New message</h3>
        <button
          type="button"
          onClick={onDiscard}
          className="btn btn-ghost btn-xs"
          aria-label="Discard">
          ✕
        </button>
      </header>
      <div className="flex flex-col gap-3 p-4">
        <div className="form-control">
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To"
            aria-label="To"
            className="input input-bordered input-sm w-full"
          />
        </div>
        <div className="form-control">
          <input
            type="email"
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="Cc"
            aria-label="Cc"
            className="input input-bordered input-sm w-full"
          />
        </div>
        <div className="form-control">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Subject"
            aria-label="Subject"
            className="input input-bordered input-sm w-full"
          />
        </div>
        <div className="form-control">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            aria-label="Message body"
            className="textarea textarea-bordered h-40 w-full resize-none"
          />
        </div>
        <footer className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSend}
            className="btn btn-primary btn-sm">
            Send
          </button>
        </footer>
      </div>
    </div>
  );
};

ComposeWindow.displayName = 'ComposeWindow';
