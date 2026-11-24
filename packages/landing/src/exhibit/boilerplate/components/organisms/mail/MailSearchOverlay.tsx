'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface SearchResult {
  id: string;
  title: string;
  snippet: string;
}

interface MailSearchOverlayProps {
  onSearch?: (query: string) => void;
  onSelect?: (result: SearchResult) => void;
  results?: SearchResult[];
}

export const MailSearchOverlay: FC<MailSearchOverlayProps> = ({
  onSearch,
  onSelect,
  results = [],
}) => {
  const [query, setQuery] = useState('');

  const submit = (): void => {
    onSearch?.(query);
  };

  return (
    <div
      className="bg-base-100 border-base-content/10 w-full max-w-xl rounded-xl border shadow-xl"
      data-testid="mail-search-overlay">
      <div className="border-base-content/10 flex items-center gap-2 border-b px-4 py-3">
        <span className="text-base-content/50">🔍</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
          placeholder="Search mail…"
          aria-label="Search mail"
          className="input input-ghost input-sm flex-1"
        />
        <button
          type="button"
          onClick={submit}
          className="btn btn-primary btn-sm">
          Search
        </button>
      </div>
      <ul className="flex max-h-72 flex-col overflow-y-auto p-2">
        {results.map((result) => (
          <li key={result.id}>
            <button
              type="button"
              onClick={() => onSelect?.(result)}
              className="hover:bg-base-200 flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-left">
              <span className="text-sm font-medium">{result.title}</span>
              <span className="text-base-content/50 text-xs">
                {result.snippet}
              </span>
            </button>
          </li>
        ))}
        {results.length === 0 && (
          <li className="text-base-content/40 p-4 text-center text-sm">
            {query ? 'No results' : 'Type to search your mail'}
          </li>
        )}
      </ul>
    </div>
  );
};

MailSearchOverlay.displayName = 'MailSearchOverlay';
