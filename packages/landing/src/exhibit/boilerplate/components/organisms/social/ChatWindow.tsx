'use client';

import { FiSend } from 'react-icons/fi';
import type { FC } from 'react';
import { useState } from 'react';
import { ChatBubble } from '../../molecules/blog/ChatBubble';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  name?: string;
  time?: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  title?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const ChatWindow: FC<ChatWindowProps> = ({
  messages,
  onSend,
  title,
  placeholder = 'Type a message...',
  disabled = false,
}) => {
  const [draft, setDraft] = useState('');

  const submit = () => {
    const text = draft.trim();
    if (!text || disabled) return;
    onSend(text);
    setDraft('');
  };

  return (
    <div className="border-base-content/10 bg-base-200 flex h-80 w-full flex-col rounded-xl border">
      {title && (
        <div className="border-base-content/10 border-b px-4 py-3">
          <h3 className="text-sm font-medium">{title}</h3>
        </div>
      )}
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-4">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            message={message.text}
            sender={message.sender}
            name={message.name}
            time={message.time}
          />
        ))}
      </div>
      <div className="border-base-content/10 flex items-center gap-2 border-t p-3">
        <input
          aria-label="Message"
          className="input input-bordered input-sm w-full"
          value={draft}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button
          aria-label="Send message"
          className="btn btn-primary btn-sm"
          disabled={disabled || draft.trim() === ''}
          onClick={submit}>
          <FiSend />
        </button>
      </div>
    </div>
  );
};
