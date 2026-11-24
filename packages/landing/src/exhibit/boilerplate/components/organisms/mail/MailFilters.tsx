'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface MailFilter {
  id: string;
  label: string;
  enabled: boolean;
}

interface MailFiltersProps {
  filters?: MailFilter[];
  onToggle?: (id: string, enabled: boolean) => void;
  onAdd?: (label: string) => void;
}

export const MailFilters: FC<MailFiltersProps> = ({
  filters = [],
  onToggle,
  onAdd,
}) => {
  const [label, setLabel] = useState('');

  const addFilter = (): void => {
    const trimmed = label.trim();
    if (trimmed) {
      onAdd?.(trimmed);
      setLabel('');
    }
  };

  return (
    <div
      className="bg-base-200 border-base-content/10 flex w-full flex-col gap-4 rounded-xl border p-4"
      data-testid="mail-filters">
      <h3 className="text-sm font-medium">Filters</h3>
      <ul className="flex flex-col gap-2">
        {filters.map((filter) => (
          <li key={filter.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={filter.enabled}
              onChange={(e) => onToggle?.(filter.id, e.target.checked)}
              aria-label={filter.label}
              className="checkbox checkbox-primary checkbox-sm"
            />
            <span className="text-sm">{filter.label}</span>
            <span
              className={`badge badge-sm ml-auto ${
                filter.enabled ? 'badge-success' : 'badge-ghost'
              }`}>
              {filter.enabled ? 'on' : 'off'}
            </span>
          </li>
        ))}
        {filters.length === 0 && (
          <li className="text-base-content/40 text-center text-sm">
            No filters configured
          </li>
        )}
      </ul>
      <div className="form-control flex flex-row gap-2">
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="New filter rule"
          aria-label="New filter rule"
          className="input input-bordered input-sm flex-1"
        />
        <button
          type="button"
          onClick={addFilter}
          className="btn btn-primary btn-sm">
          Add
        </button>
      </div>
    </div>
  );
};

MailFilters.displayName = 'MailFilters';
