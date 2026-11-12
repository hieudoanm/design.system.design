'use client';

import { type FC, useState, useRef, useEffect } from 'react';
import { FiSend, FiPaperclip } from 'react-icons/fi';

interface ChatInputProps {
  onSend: (content: string) => void;
  disabled?: boolean;
}

export const ChatInput: FC<ChatInputProps> = ({ onSend, disabled }) => {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 150)}px`;
  };

  useEffect(() => {
    adjustHeight();
  }, [value]);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-base-300 bg-base-100 sticky bottom-0 border-t p-4">
      <div className="flex items-end gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-circle"
          title="Attach file">
          <FiPaperclip className="size-5" />
        </button>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Shift+Enter for newline)"
          className="textarea textarea-bordered w-full resize-none"
          rows={1}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          className="btn btn-primary btn-circle"
          title="Send message">
          <FiSend className="size-5" />
        </button>
      </div>
    </div>
  );
};
