'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

interface ChatMessage {
  author: string;
  text: string;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  { author: 'Support', text: 'Hi! How can we help you today?' },
  {
    author: 'Support',
    text: 'Let us know your issue and we will take a look.',
  },
];

const QUICK_REPLIES = ['Reset password', 'Billing'];

export const LiveChatTemplate: FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [draft, setDraft] = useState('');

  const send = (text?: string) => {
    const value = (text ?? draft).trim();
    if (!value) return;
    setMessages((prev) => [...prev, { author: 'You', text: value }]);
    setDraft('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Live Chat</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Chat with our support team.
        </p>
      </header>

      <main className="mx-auto w-full max-w-2xl p-6">
        <p className="text-base-content/50 mb-4 text-sm">
          {messages.length} messages
        </p>

        <div className="card bg-base-200 border-base-content/10 mb-4 border">
          <div className="card-body flex flex-col gap-2 p-5">
            {messages.map((message, index) => (
              <p key={index} className="text-sm">
                {message.author}: {message.text}
              </p>
            ))}
          </div>
        </div>

        <div className="mb-4 flex gap-2">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => send(reply)}
              className="btn btn-ghost btn-xs">
              {reply}
            </button>
          ))}
        </div>

        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body flex gap-2 p-4">
            <input
              aria-label="Type a message"
              placeholder="Message..."
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="input input-bordered input-sm w-full"
            />
            <button
              onClick={() => send()}
              className="btn btn-primary btn-sm gap-1">
              <FiSend />
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

LiveChatTemplate.displayName = 'LiveChatTemplate';
