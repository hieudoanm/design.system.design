import type { FC } from 'react';

interface Result {
  id: string;
  from: string;
  subject: string;
  preview: string;
}

interface SearchResultsProps {
  query: string;
  results: Result[];
  onSelect?: (id: string) => void;
}

export const SearchResults: FC<SearchResultsProps> = ({
  query,
  results,
  onSelect,
}) => (
  <div className="flex flex-col gap-2" data-testid="search-results">
    <p className="text-base-content/50 text-sm">
      {results.length} result{results.length === 1 ? '' : 's'} for “{query}”
    </p>
    {results.length === 0 && (
      <p className="text-base-content/50 py-4 text-center text-sm">
        No emails match your search.
      </p>
    )}
    {results.map((result) => (
      <button
        key={result.id}
        type="button"
        onClick={() => onSelect?.(result.id)}
        className="border-base-content/10 hover:bg-base-200 flex flex-col gap-0.5 rounded-lg border px-3 py-2 text-left">
        <span className="text-sm font-medium">{result.from}</span>
        <span className="text-sm">{result.subject}</span>
        <span className="text-base-content/50 truncate text-sm">
          {result.preview}
        </span>
      </button>
    ))}
  </div>
);

SearchResults.displayName = 'SearchResults';
