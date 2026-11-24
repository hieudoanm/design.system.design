'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ChatMessage {
  id: string;
  sender: 'me' | 'them';
  text: string;
  time: string;
}

interface MessengerViewProps {
  initialMessages?: ChatMessage[];
  contactName?: string;
  placeholder?: string;
  onSend?: (text: string) => void;
}

export const MessengerView: FC<MessengerViewProps> = ({
  initialMessages = [],
  contactName,
  placeholder = 'Type a message...',
  onSend,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState('');

  const send = () => {
    const text = draft.trim();
    if (!text) return;
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text,
      time: 'now',
    };
    setMessages((prev) => [...prev, message]);
    setDraft('');
    onSend?.(text);
  };

  return (
    <div
      data-testid="messenger"
      className="border-base-content/10 bg-base-200 flex h-96 w-full flex-col rounded-xl border">
      <div className="border-base-content/10 border-b px-4 py-3">
        <h2 className="text-sm font-medium">{contactName ?? 'Messages'}</h2>
      </div>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="text-base-content/50 text-center text-sm">
            No messages yet
          </p>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat ${message.sender === 'me' ? 'chat-end' : 'chat-start'}`}>
            <div
              className={`chat-bubble ${
                message.sender === 'me' ? 'chat-bubble-primary' : ''
              }`}>
              {message.text}
            </div>
            <div className="chat-footer text-xs opacity-50">{message.time}</div>
          </div>
        ))}
      </div>
      <div className="border-base-content/10 flex items-center gap-2 border-t p-3">
        <input
          aria-label="Message input"
          className="input input-bordered input-sm w-full"
          value={draft}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              send();
            }
          }}
        />
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={draft.trim() === ''}
          onClick={send}>
          <span aria-hidden="true">&#10148;</span>
          Send
        </button>
      </div>
    </div>
  );
};
