'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  keywords?: string[];
  icon?: ReactNode;
  onSelect?: () => void;
  group?: string;
}

interface CommandMenuProps {
  open: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
}

export const CommandMenu: FC<CommandMenuProps> = ({
  open,
  onClose,
  items,
  placeholder = 'Type a command or search…',
}) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? items.filter(
          (item) =>
            item.label.toLowerCase().includes(needle) ||
            item.description?.toLowerCase().includes(needle) ||
            item.keywords?.some((keyword) =>
              keyword.toLowerCase().includes(needle)
            )
        )
      : items;
  }, [items, query]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(
          (current) => (current + 1) % Math.max(filtered.length, 1)
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(
          (current) =>
            (current - 1 + Math.max(filtered.length, 1)) %
            Math.max(filtered.length, 1)
        );
      } else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault();
        filtered[activeIndex].onSelect?.();
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, filtered, activeIndex, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
      <button
        type="button"
        aria-label="Close command menu"
        className="bg-base-content/40 absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command menu"
        className="bg-base-100 border-base-content/10 relative w-full max-w-md overflow-hidden rounded-2xl border shadow-2xl">
        <div className="flex items-center gap-2 border-b px-4 py-3">
          <FiSearch className="text-base-content/50 shrink-0" />
          <input
            ref={inputRef}
            aria-label="Search commands"
            className="w-full bg-transparent text-sm outline-none"
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIndex(0);
            }}
          />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="text-base-content/50 px-3 py-6 text-center text-sm">
              No results.
            </p>
          )}
          {filtered.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm ${
                index === activeIndex
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-base-200'
              }`}
              onMouseEnter={() => setActiveIndex(index)}
              onClick={() => {
                item.onSelect?.();
                onClose();
              }}>
              {item.icon && (
                <span className="text-base-content/60 shrink-0">
                  {item.icon}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.label}</span>
                {item.description && (
                  <span className="text-base-content/50 block truncate text-xs">
                    {item.description}
                  </span>
                )}
              </span>
              {item.group && (
                <span className="badge badge-ghost badge-sm shrink-0">
                  {item.group}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
