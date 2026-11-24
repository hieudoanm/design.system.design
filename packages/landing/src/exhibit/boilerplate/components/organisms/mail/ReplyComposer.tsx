'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ReplyComposerProps {
  recipient?: string;
  subject?: string;
  quoted?: string;
  onSend?: (payload: {
    recipient: string;
    subject: string;
    body: string;
  }) => void;
  onCancel?: () => void;
}

export const ReplyComposer: FC<ReplyComposerProps> = ({
  recipient,
  subject,
  quoted,
  onSend,
  onCancel,
}) => {
  const [body, setBody] = useState('');

  const handleSend = (): void => {
    onSend?.({ recipient: recipient ?? '', subject: subject ?? '', body });
  };

  return (
    <div
      className="border-base-content/10 bg-base-100 w-full rounded-xl border shadow-lg"
      data-testid="reply-composer">
      <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-medium">Reply</h3>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost btn-xs"
          aria-label="Cancel reply">
          ✕
        </button>
      </header>
      <div className="flex flex-col gap-3 p-4">
        <div className="text-sm">
          <span className="text-base-content/50">To: </span>
          <span className="font-medium">{recipient}</span>
        </div>
        <div className="text-sm">
          <span className="text-base-content/50">Subject: </span>
          <span className="font-medium">{subject}</span>
        </div>
        {quoted && (
          <blockquote className="border-base-content/20 bg-base-200/60 rounded-r-lg border-l-2 pl-3 text-sm italic">
            {quoted}
          </blockquote>
        )}
        <div className="form-control">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your reply…"
            aria-label="Reply body"
            className="textarea textarea-bordered h-28 w-full resize-none"
          />
        </div>
        <footer className="flex justify-end gap-2">
          <button
            type="button"
            onClick={handleSend}
            className="btn btn-primary btn-sm">
            Send reply
          </button>
        </footer>
      </div>
    </div>
  );
};

ReplyComposer.displayName = 'ReplyComposer';
