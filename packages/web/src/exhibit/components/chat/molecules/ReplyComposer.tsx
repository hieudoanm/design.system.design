'use client';

import { type FC, useState, useRef } from 'react';
import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import type { Message } from '@/exhibit/types/chat';
import { formatChatTime } from '@/exhibit/lib/chat/format';

interface ReplyComposerProps {
  replyingTo: Message;
  authorName?: string;
  onSend: (text: string) => void;
  onCancel: () => void;
}

export const ReplyComposer: FC<ReplyComposerProps> = ({
  replyingTo,
  authorName,
  onSend,
  onCancel,
}) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const submit = (): void => {
    const value = text.trim();
    if (value === '') return;
    onSend(value);
    setText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setText(event.target.value);
    event.target.style.height = 'auto';
    event.target.style.height = `${event.target.scrollHeight}px`;
  };

  return (
    <div className="border-base-300 bg-base-200/60 border-t">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold">
            Replying to {authorName ?? 'message'}
          </p>
          <p className="text-base-content/50 truncate text-xs">
            {replyingTo.text.length > 60
              ? `${replyingTo.text.slice(0, 60)}…`
              : replyingTo.text}
          </p>
        </div>
        <span className="text-base-content/40 shrink-0 text-[10px]">
          {formatChatTime(replyingTo.createdAt)}
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel reply"
          className="btn btn-xs btn-ghost">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-end gap-2 p-3 pt-0">
        <textarea
          ref={inputRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Reply…"
          rows={1}
          aria-label="Reply message"
          className="textarea textarea-bordered max-h-32 flex-1 resize-none"
        />
        <button
          type="button"
          onClick={submit}
          disabled={text.trim() === ''}
          aria-label="Send reply"
          className="btn btn-primary btn-circle">
          <FaPaperPlane aria-hidden="true" />
        </button>
      </div>
    </div>
  );
};
