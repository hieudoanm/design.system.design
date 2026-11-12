'use client';

import { type FC } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface ChatSearchBarProps {
  query: string;
  onChange: (value: string) => void;
  resultCount: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
}

export const ChatSearchBar: FC<ChatSearchBarProps> = ({
  query,
  onChange,
  resultCount,
  currentIndex,
  onPrev,
  onNext,
}) => (
  <div className="bg-base-100 border-base-300 flex items-center gap-2 border-b px-3 py-2">
    <FaSearch
      aria-hidden="true"
      className="text-base-content/40 h-4 w-4 shrink-0"
    />
    <input
      type="search"
      value={query}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search in chat…"
      aria-label="Search in chat"
      className="input input-sm w-full grow"
      autoFocus
    />
    {query.trim() !== '' && (
      <>
        <span className="text-base-content/50 shrink-0 text-xs">
          {resultCount === 0
            ? 'No results'
            : `${currentIndex + 1}/${resultCount}`}
        </span>
        <button
          type="button"
          onClick={onPrev}
          disabled={resultCount === 0}
          aria-label="Previous result"
          className="btn btn-xs btn-ghost">
          ↑
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={resultCount === 0}
          aria-label="Next result"
          className="btn btn-xs btn-ghost">
          ↓
        </button>
      </>
    )}
    <button
      type="button"
      onClick={() => onChange('')}
      aria-label="Close search"
      className="btn btn-xs btn-ghost">
      <FaTimes aria-hidden="true" />
    </button>
  </div>
);
