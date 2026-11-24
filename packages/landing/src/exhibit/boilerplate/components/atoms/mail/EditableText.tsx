'use client';

import { useState } from 'react';
import type { FC, KeyboardEvent } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const EditableText: FC<EditableTextProps> = ({
  value,
  onChange,
  label,
  placeholder = 'Click to edit',
  className = '',
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const start = (): void => {
    setDraft(value);
    setEditing(true);
  };

  const commit = (): void => {
    setEditing(false);
    onChange(draft.trim());
  };

  const cancel = (): void => {
    setEditing(false);
    setDraft(value);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') cancel();
  };

  if (editing) {
    return (
      <input
        aria-label={label}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus
        className={`input input-bordered input-sm w-full ${className}`}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={label ? `Edit ${label}` : 'Edit text'}
      title="Click to edit"
      onClick={start}
      className={`text-left text-sm underline decoration-dotted underline-offset-4 hover:opacity-70 ${className}`}>
      {value || placeholder}
    </button>
  );
};
