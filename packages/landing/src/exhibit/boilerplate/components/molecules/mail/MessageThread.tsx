'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface Message {
  id: string;
  author: string;
  time: string;
  body: string;
}

interface MessageThreadProps {
  subject: string;
  messages: Message[];
  onReply?: (messageId: string) => void;
}

export const MessageThread: FC<MessageThreadProps> = ({
  subject,
  messages,
  onReply,
}) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? messages : messages.slice(0, 1);

  return (
    <article className="flex flex-col gap-4" data-testid="message-thread">
      <h3 className="text-lg">{subject}</h3>
      {visible.map((message) => (
        <div key={message.id} className="card bg-base-200">
          <div className="card-body gap-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{message.author}</span>
              <span className="text-base-content/50 text-xs">
                {message.time}
              </span>
            </div>
            <p>{message.body}</p>
            <div className="card-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => onReply?.(message.id)}>
                Reply
              </button>
            </div>
          </div>
        </div>
      ))}
      {messages.length > 1 && (
        <button
          type="button"
          className="btn btn-ghost btn-sm self-start"
          onClick={() => setExpanded((value) => !value)}>
          {expanded
            ? 'Collapse replies'
            : `Show ${messages.length - 1} more replies`}
        </button>
      )}
    </article>
  );
};

MessageThread.displayName = 'MessageThread';
