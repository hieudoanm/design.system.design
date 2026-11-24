'use client';

import { FiMinus, FiPlus } from 'react-icons/fi';
import type { FC } from 'react';

interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
}

export const NumberField: FC<NumberFieldProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled = false,
}) => {
  const clamp = (next: number): number => {
    if (min !== undefined && next < min) return min;
    if (max !== undefined && next > max) return max;
    return next;
  };

  const id = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="join w-full">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          className="join-item btn btn-outline"
          disabled={disabled}
          onClick={() => onChange(clamp(value - step))}>
          <FiMinus />
        </button>
        <input
          id={id}
          type="number"
          className="input input-bordered join-item w-full"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => {
            const next = Number(e.target.value);
            if (!Number.isNaN(next)) onChange(clamp(next));
          }}
        />
        <button
          type="button"
          aria-label={`Increase ${label}`}
          className="join-item btn btn-outline"
          disabled={disabled}
          onClick={() => onChange(clamp(value + step))}>
          <FiPlus />
        </button>
      </div>
    </div>
  );
};
