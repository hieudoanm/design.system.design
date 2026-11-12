'use client';

import { type FC, useState } from 'react';
import { FiCheck, FiCopy } from 'react-icons/fi';
import type { Message } from '@/exhibit/types/ai';
import {
  formatRelativeTime,
  formatAbsoluteTime,
  copyToClipboard,
} from '@/exhibit/utils/ai/format';
import { useToast } from '@/exhibit/providers/ai/ToastProvider';
import { useData } from '@/exhibit/providers/ai/DataProvider';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble: FC<MessageBubbleProps> = ({ message }) => {
  const { addToast } = useToast();
  const { updateMessageReaction } = useData();
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopied(true);
      addToast('Message copied', 'success');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReaction = async (reaction: 'thumbs-up' | 'thumbs-down') => {
    const newReaction = message.reaction === reaction ? null : reaction;
    await updateMessageReaction(message.id, newReaction);
  };

  return (
    <div className={`chat ${isUser ? 'chat-end' : 'chat-start'}`}>
      <div className="chat-header mb-1 text-xs opacity-60">
        {isUser ? 'You' : (message.model ?? 'Assistant')}
        <time className="ml-2" title={formatAbsoluteTime(message.timestamp)}>
          {formatRelativeTime(message.timestamp)}
        </time>
      </div>
      <div
        className={`chat-bubble ${
          isUser ? 'chat-bubble-primary' : 'chat-bubble-neutral'
        }`}>
        {message.content}
      </div>
      <div className="chat-footer mt-1 flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="btn btn-ghost btn-xs"
          title="Copy message">
          {copied ? (
            <FiCheck className="size-3" />
          ) : (
            <FiCopy className="size-3" />
          )}
        </button>
        {!isUser && (
          <>
            <button
              type="button"
              onClick={() => handleReaction('thumbs-up')}
              className={`btn btn-ghost btn-xs ${
                message.reaction === 'thumbs-up' ? 'text-success' : ''
              }`}
              title="Thumbs up">
              👍
            </button>
            <button
              type="button"
              onClick={() => handleReaction('thumbs-down')}
              className={`btn btn-ghost btn-xs ${
                message.reaction === 'thumbs-down' ? 'text-error' : ''
              }`}
              title="Thumbs down">
              👎
            </button>
          </>
        )}
      </div>
    </div>
  );
};
