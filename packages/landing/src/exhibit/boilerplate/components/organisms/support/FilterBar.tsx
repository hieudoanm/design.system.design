'use client';

import type { FC, ReactNode } from 'react';
import { FiSearch } from 'react-icons/fi';

interface FilterBarProps {
  query: string;
  onQueryChange: (next: string) => void;
  placeholder?: string;
  children?: ReactNode;
}

export const FilterBar: FC<FilterBarProps> = ({
  query,
  onQueryChange,
  placeholder = 'Search…',
  children,
}) => (
  <div className="flex w-full flex-wrap items-center gap-3">
    <label className="border-base-content/10 bg-base-100 flex min-h-11 flex-1 items-center gap-2 rounded-xl border px-3">
      <FiSearch className="text-base-content/40 h-4 w-4" />
      <input
        type="search"
        value={query}
        placeholder={placeholder}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full bg-transparent text-sm outline-none"
        aria-label="Search"
      />
    </label>
    {children && (
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    )}
  </div>
);

FilterBar.displayName = 'FilterBar';
