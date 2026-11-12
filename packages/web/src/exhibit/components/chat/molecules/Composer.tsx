'use client';

import { type FC, useState, useRef } from 'react';
import { FaPaperPlane } from 'react-icons/fa';

interface ComposerProps {
  onSend: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
  incognito?: boolean;
}

export const Composer: FC<ComposerProps> = ({
  onSend,
  placeholder = 'Type a message…',
  disabled = false,
  incognito = false,
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
    <div className="border-base-300 bg-base-100 flex items-end gap-2 border-t p-3">
      {incognito && (
        <div className="bg-warning/10 text-warning absolute -top-6 right-0 left-0 rounded-t-lg px-3 py-1 text-center text-[10px]">
          Incognito keyboard — text is not saved to suggestions
        </div>
      )}
      <textarea
        ref={inputRef}
        value={text}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={1}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        aria-label="Message"
        className={`textarea textarea-bordered max-h-32 flex-1 resize-none ${incognito ? 'bg-base-200' : ''}`}
      />
      <button
        type="button"
        onClick={submit}
        disabled={disabled || text.trim() === ''}
        aria-label="Send message"
        className="btn btn-primary btn-circle">
        <FaPaperPlane aria-hidden="true" />
      </button>
    </div>
  );
};
