'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

interface ThreadMessage {
  from: string;
  text: string;
}

const MESSAGES: ThreadMessage[] = [
  { from: 'GitHub', text: 'Build passed for the latest commit.' },
  { from: 'You', text: 'Thanks for the update.' },
  { from: 'GitHub', text: 'Deployment is now live on production.' },
];

export const ThreadTemplate: FC = () => {
  const [messages, setMessages] = useState<ThreadMessage[]>(MESSAGES);
  const [reply, setReply] = useState('');

  const sendReply = () => {
    const text = reply.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: 'You', text }]);
    setReply('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Thread</h1>
        <p className="text-base-content/50 mt-1 text-sm">Email conversation.</p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {messages.length} messages
        </p>

        <div className="card bg-base-200 border-base-content/10 mb-6 border">
          <div className="card-body p-5">
            <div className="divide-base-content/10 flex flex-col gap-3 divide-y">
              {messages.map((message, index) => (
                <p
                  key={`${message.from}-${index}`}
                  className="pt-3 text-sm first:pt-0">
                  {message.from}: {message.text}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-5">
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Write a reply..."
              aria-label="Reply"
              rows={4}
              className="textarea textarea-bordered"
            />
            <div>
              <button
                onClick={sendReply}
                className="btn btn-primary btn-sm gap-1">
                <FiSend />
                Reply
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

ThreadTemplate.displayName = 'ThreadTemplate';
