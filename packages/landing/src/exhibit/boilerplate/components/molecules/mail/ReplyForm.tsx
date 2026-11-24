'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface ReplyFormProps {
  to: string;
  subject: string;
  placeholder?: string;
  onSend?: (body: string) => void;
  onCancel?: () => void;
}

export const ReplyForm: FC<ReplyFormProps> = ({
  to,
  subject,
  placeholder = 'Write your reply...',
  onSend,
  onCancel,
}) => {
  const [body, setBody] = useState('');

  return (
    <form
      data-testid="reply-form"
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSend?.(body);
      }}>
      <p className="text-base-content/50 text-sm">
        Reply to <span className="text-base-content font-medium">{to}</span> —{' '}
        {subject}
      </p>
      <textarea
        aria-label="Reply body"
        rows={5}
        placeholder={placeholder}
        className="textarea textarea-bordered"
        value={body}
        onChange={(e) => setBody(e.target.value)}
      />
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button
          type="submit"
          data-testid="reply-send"
          className="btn btn-primary">
          Send
        </button>
      </div>
    </form>
  );
};

ReplyForm.displayName = 'ReplyForm';
