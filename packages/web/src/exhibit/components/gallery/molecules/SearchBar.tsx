'use client';

import { type FC } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search photos...',
  autoFocus = false,
}) => (
  <label className="input input-sm flex items-center gap-2 rounded-full">
    <FiSearch className="text-base-content/50 size-4" />
    <input
      type="text"
      value={value}
      placeholder={placeholder}
      autoFocus={autoFocus}
      onChange={(e) => onChange(e.target.value)}
      className="grow"
    />
    {value && (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => onChange('')}
        className="text-base-content/50 hover:text-base-content">
        <FiX className="size-4" />
      </button>
    )}
  </label>
);
