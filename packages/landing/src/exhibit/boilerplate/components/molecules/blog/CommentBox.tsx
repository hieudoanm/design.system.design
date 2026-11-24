'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface CommentBoxProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  submitLabel?: string;
  author?: string;
}

export const CommentBox: FC<CommentBoxProps> = ({
  onSubmit,
  placeholder = 'Write a comment...',
  submitLabel = 'Post comment',
  author = 'Guest',
}) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setText('');
  };

  return (
    <form
      data-testid="comment-box"
      className="card bg-base-100 shadow-sm"
      onSubmit={handleSubmit}>
      <div className="card-body">
        <div className="flex items-center gap-2">
          <div className="avatar placeholder">
            <div className="bg-primary text-primary-content w-8 rounded-full">
              <span className="text-xs font-bold">{author.charAt(0)}</span>
            </div>
          </div>
          <p className="font-medium">{author}</p>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          aria-label="Comment"
          className="textarea textarea-bordered w-full"
        />
        <div className="card-actions justify-end">
          <button
            type="submit"
            disabled={!text.trim()}
            className="btn btn-primary btn-sm">
            {submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

CommentBox.displayName = 'CommentBox';
