'use client';

import type { FC } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClass: Record<NonNullable<SearchBarProps['size']>, string> = {
  sm: 'input-sm',
  md: '',
  lg: 'input-lg',
};

export const SearchBar: FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  size = 'md',
  disabled = false,
}) => (
  <div className="relative w-full">
    <FiSearch className="text-base-content/40 absolute top-1/2 left-3 -translate-y-1/2" />
    <input
      type="search"
      role="searchbox"
      className={`input input-bordered input-primary w-full pr-10 pl-10 ${sizeClass[size]}`}
      value={value}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
    {value && !disabled && (
      <button
        aria-label="Clear search"
        onClick={() => onChange('')}
        className="btn btn-ghost btn-xs absolute top-1/2 right-2 -translate-y-1/2">
        <FiX />
      </button>
    )}
  </div>
);
