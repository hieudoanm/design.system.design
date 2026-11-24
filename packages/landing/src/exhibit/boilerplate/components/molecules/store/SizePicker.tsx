'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface SizePickerProps {
  sizes: string[];
  defaultSelected?: string;
  onSelect?: (size: string) => void;
  label?: string;
}

export const SizePicker: FC<SizePickerProps> = ({
  sizes,
  defaultSelected,
  onSelect,
  label = 'Select size',
}) => {
  const [selected, setSelected] = useState<string | undefined>(defaultSelected);

  return (
    <div role="group" aria-label={label} data-testid="size-picker">
      <span className="label label-text">{label}</span>
      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => (
          <button
            key={size}
            type="button"
            className={`btn btn-sm ${selected === size ? 'btn-primary' : 'btn-ghost'}`}
            aria-pressed={selected === size}
            onClick={() => {
              setSelected(size);
              onSelect?.(size);
            }}>
            {size}
          </button>
        ))}
      </div>
    </div>
  );
};
