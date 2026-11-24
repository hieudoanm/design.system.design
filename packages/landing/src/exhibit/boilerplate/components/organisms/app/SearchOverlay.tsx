'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface SearchResult {
  id: string;
  label: string;
  description?: string;
}

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  onSearch?: (query: string) => void;
  results?: SearchResult[];
  placeholder?: string;
}

export const SearchOverlay: FC<SearchOverlayProps> = ({
  open,
  onClose,
  onSearch,
  results = [],
  placeholder = 'Search…',
}) => {
  const [query, setQuery] = useState('');

  if (!open) return null;

  return (
    <div
      data-testid="search-overlay"
      role="dialog"
      aria-label="Search"
      className="fixed inset-0 z-50">
      <div
        data-testid="search-backdrop"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="absolute top-16 right-0 left-0 mx-auto w-full max-w-xl px-4">
        <div className="bg-base-100 rounded-2xl p-4 shadow-2xl">
          <input
            autoFocus
            type="search"
            value={query}
            placeholder={placeholder}
            data-testid="search-input"
            onChange={(e) => {
              setQuery(e.target.value);
              onSearch?.(e.target.value);
            }}
            className="input input-bordered w-full"
          />
          {results.length > 0 && (
            <ul className="mt-3 flex max-h-80 flex-col gap-1 overflow-y-auto">
              {results.map((result) => (
                <li
                  key={result.id}
                  data-testid={`search-result-${result.id}`}
                  className="hover:bg-base-200 rounded-lg px-3 py-2">
                  <p className="text-sm font-medium">{result.label}</p>
                  {result.description && (
                    <p className="text-base-content/60 text-sm">
                      {result.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
          {query && results.length === 0 && (
            <p className="text-base-content/40 mt-3 text-center text-sm">
              No results for “{query}”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
