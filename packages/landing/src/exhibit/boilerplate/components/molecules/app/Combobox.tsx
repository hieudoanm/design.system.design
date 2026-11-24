'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiChevronDown, FiSearch } from 'react-icons/fi';
import type { FC } from 'react';

interface ComboboxOption {
  label: string;
  value: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  emptyText?: string;
  disabled?: boolean;
}

export const Combobox: FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select an option',
  emptyText = 'No results.',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selected = options.find((option) => option.value === value);

  const filtered = useMemo(
    () =>
      options.filter((option) =>
        option.label.toLowerCase().includes(query.trim().toLowerCase())
      ),
    [options, query]
  );

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {label && <span className="mb-1 block text-sm font-medium">{label}</span>}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={label ?? 'Select'}
        className="select select-bordered flex w-full items-center justify-between"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}>
        <span className={selected ? '' : 'text-base-content/50'}>
          {selected ? selected.label : placeholder}
        </span>
        <FiChevronDown className="text-base-content/50" />
      </button>
      {open && (
        <div className="bg-base-100 border-base-content/10 absolute z-10 mt-2 w-full rounded-xl border p-2 shadow-xl">
          <div className="flex items-center gap-2 px-2 pb-2">
            <FiSearch className="text-base-content/50 shrink-0" />
            <input
              aria-label="Search options"
              className="input input-bordered input-sm w-full"
              value={query}
              autoFocus
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ul
            role="listbox"
            className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {filtered.length === 0 && (
              <li className="text-base-content/50 px-3 py-2 text-sm">
                {emptyText}
              </li>
            )}
            {filtered.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}>
                <button
                  type="button"
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    option.value === value
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-base-200'
                  }`}
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                    setQuery('');
                  }}>
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
