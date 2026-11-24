'use client';

import type { FC } from 'react';

interface FilterOption {
  value: string;
  label: string;
}

interface FilterGroupProps {
  name: string;
  options: FilterOption[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export const FilterGroup: FC<FilterGroupProps> = ({
  name,
  options,
  selected,
  onChange,
}) => {
  const toggle = (optionValue: string) => {
    onChange(
      selected.includes(optionValue)
        ? selected.filter((value) => value !== optionValue)
        : [...selected, optionValue]
    );
  };

  return (
    <div className="gap-2 filter">
      {options.map((option) => {
        const checked = selected.includes(option.value);
        return (
          <input
            key={option.value}
            type="checkbox"
            name={name}
            value={option.value}
            checked={checked}
            onChange={() => toggle(option.value)}
            aria-label={option.label}
            className={`cursor-pointer ${checked ? 'btn-primary text-primary-content' : ''}`}
          />
        );
      })}
      {selected.length > 0 && (
        <button
          type="button"
          className="filter-reset btn-ghost btn-sm"
          onClick={() => onChange([])}>
          Reset
        </button>
      )}
    </div>
  );
};

FilterGroup.displayName = 'FilterGroup';
