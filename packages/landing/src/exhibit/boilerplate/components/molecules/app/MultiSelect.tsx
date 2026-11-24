'use client';

import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  placeholder?: string;
}

export const MultiSelect: FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  label,
  placeholder = 'Select…',
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (optionValue: string) => {
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue]
    );
  };

  const selectedLabels = options
    .filter((option) => value.includes(option.value))
    .map((option) => option.label);

  return (
    <div ref={ref} className="flex w-full flex-col gap-1">
      {label && <span className="label-text">{label}</span>}
      <div className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="border-base-content/10 bg-base-100 flex min-h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-sm">
          <span
            className={`flex flex-wrap gap-1 ${
              selectedLabels.length === 0 ? 'text-base-content/40' : ''
            }`}>
            {selectedLabels.length === 0
              ? placeholder
              : selectedLabels.map((selected) => (
                  <span
                    key={selected}
                    className="bg-base-200 rounded-full px-2 py-0.5 text-xs">
                    {selected}
                  </span>
                ))}
          </span>
          <span className="text-base-content/40">{open ? '▲' : '▼'}</span>
        </button>
        {open && (
          <div
            role="listbox"
            className="border-base-content/10 bg-base-100 absolute top-full left-0 z-50 mt-1 w-full rounded-xl border p-1 shadow-lg">
            {options.map((option) => {
              const checked = value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="hover:bg-base-200 flex cursor-pointer items-center gap-2 px-3 py-2 text-sm">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleOption(option.value)}
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

MultiSelect.displayName = 'MultiSelect';
