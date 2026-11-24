'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface SearchFiltersProps {
  onSearch?: (query: string) => void;
  sortOptions?: string[];
  defaultSort?: string;
  placeholder?: string;
}

export const SearchFilters: FC<SearchFiltersProps> = ({
  onSearch,
  sortOptions = ['Price', 'Rating', 'Duration'],
  defaultSort = 'Price',
  placeholder = 'Search trips, hotels, flights',
}) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState(defaultSort);

  return (
    <div className="flex flex-col gap-3" data-testid="search-filters">
      <div className="join w-full">
        <input
          className="input input-bordered join-item w-full"
          aria-label="Search"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className="btn btn-primary join-item"
          onClick={() => onSearch?.(query)}>
          Search
        </button>
      </div>
      <select
        className="select select-bordered w-full max-w-xs"
        aria-label="Sort by"
        value={sort}
        onChange={(e) => setSort(e.target.value)}>
        {sortOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};
