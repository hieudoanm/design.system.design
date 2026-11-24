'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiSend } from 'react-icons/fi';

interface Message {
  author: string;
  text: string;
  time: string;
}

interface Thread {
  id: string;
  name: string;
  unread: number;
  messages: Message[];
}

const THREADS: Thread[] = [
  {
    id: 't1',
    name: 'Jane Doe',
    unread: 2,
    messages: [
      { author: 'Jane Doe', text: 'Are we still on for Friday?', time: '9:02' },
      { author: 'You', text: 'Yes, see you at the usual spot.', time: '9:15' },
      { author: 'Jane Doe', text: 'Perfect, bring the notes.', time: '9:31' },
    ],
  },
  {
    id: 't2',
    name: 'Alex Chen',
    unread: 0,
    messages: [
      {
        author: 'Alex Chen',
        text: 'Thanks for the review!',
        time: 'Yesterday',
      },
      {
        author: 'You',
        text: 'Anytime, let me know if anything needs fixing.',
        time: 'Yesterday',
      },
    ],
  },
  {
    id: 't3',
    name: 'Sam Rivera',
    unread: 1,
    messages: [
      {
        author: 'Sam Rivera',
        text: 'Did you see the new camera I got?',
        time: 'Mon',
      },
    ],
  },
];

export const MessagesTemplate: FC = () => {
  const [threads, setThreads] = useState<Thread[]>(THREADS);
  const [selectedId, setSelectedId] = useState<string>(THREADS[0].id);
  const [draft, setDraft] = useState('');

  const selected =
    threads.find((thread) => thread.id === selectedId) ?? threads[0];

  const selectThread = (id: string) => {
    setSelectedId(id);
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === id ? { ...thread, unread: 0 } : thread
      )
    );
  };

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    setThreads((prev) =>
      prev.map((thread) =>
        thread.id === selectedId
          ? {
              ...thread,
              messages: [
                ...thread.messages,
                { author: 'You', text, time: 'Now' },
              ],
            }
          : thread
      )
    );
    setDraft('');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Messages</h1>
        <p className="text-base-content/50 mt-1 text-sm">Direct messages.</p>
      </header>

      <main className="mx-auto w-full max-w-3xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body p-0">
            <div className="flex">
              <div className="border-base-content/10 hidden w-56 flex-col gap-1 border-r p-3 md:flex">
                {threads.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => selectThread(thread.id)}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                      thread.id === selectedId
                        ? 'bg-base-300'
                        : 'bg-transparent'
                    }`}>
                    <span>{thread.name}</span>
                    {thread.unread > 0 ? (
                      <span className="badge badge-error badge-sm">
                        {thread.unread} unread
                      </span>
                    ) : (
                      <span className="badge badge-ghost badge-sm">Read</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="border-base-content/10 flex items-center justify-between border-b p-4">
                  <p className="text-sm font-medium">
                    Conversation with {selected.name}
                  </p>
                  {selected.unread > 0 && (
                    <span className="badge badge-error badge-sm">
                      {selected.unread} unread
                    </span>
                  )}
                </div>

                <div className="flex min-h-48 flex-col gap-2 p-4">
                  {selected.messages.map((message, index) => (
                    <p key={index} className="text-sm">
                      {message.author}: {message.text}
                    </p>
                  ))}
                </div>

                <div className="border-base-content/10 flex gap-2 border-t p-4">
                  <input
                    aria-label="Type a message"
                    placeholder="Message..."
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    className="input input-bordered input-sm w-full"
                  />
                  <button
                    onClick={send}
                    className="btn btn-primary btn-sm gap-1">
                    <FiSend />
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

MessagesTemplate.displayName = 'MessagesTemplate';
