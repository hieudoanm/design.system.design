'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  swatches?: string[];
  disabled?: boolean;
}

const DEFAULT_SWATCHES = [
  '#3b82f6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#64748b',
];

const HEX_PATTERN = /^#?([0-9a-fA-F]{6})$/;

export const ColorPicker: FC<ColorPickerProps> = ({
  value,
  onChange,
  label,
  swatches = DEFAULT_SWATCHES,
  disabled = false,
}) => {
  const [draft, setDraft] = useState(value);

  const commit = () => {
    const match = draft.trim().match(HEX_PATTERN);
    if (match) {
      const normalized = `#${match[1].toLowerCase()}`;
      onChange(normalized);
      setDraft(normalized);
    } else {
      setDraft(value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="flex items-center gap-2">
        <div
          className="border-base-300 h-8 w-8 shrink-0 rounded-full border"
          style={{ backgroundColor: value }}
        />
        <div className="flex flex-wrap gap-1">
          {swatches.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={`Pick ${swatch}`}
              aria-pressed={swatch === value}
              className={`h-6 w-6 rounded-full border border-black/10 ${
                swatch === value ? 'ring-primary ring-2 ring-offset-2' : ''
              }`}
              style={{ backgroundColor: swatch }}
              disabled={disabled}
              onClick={() => {
                onChange(swatch);
                setDraft(swatch);
              }}
            />
          ))}
        </div>
      </div>
      <input
        aria-label={`${label ?? 'Color'} hex value`}
        className="input input-bordered w-36"
        value={draft}
        disabled={disabled}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit();
        }}
      />
    </div>
  );
};
