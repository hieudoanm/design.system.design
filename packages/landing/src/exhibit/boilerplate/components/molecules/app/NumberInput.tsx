import type { FC } from 'react';

interface NumberInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
}

export const NumberInput: FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  error,
  hint,
  disabled = false,
}) => {
  const id = label.toLowerCase().replace(/\s+/g, '-');
  const outOfRange =
    (min !== undefined && value < min) || (max !== undefined && value > max);
  const message =
    error ??
    (outOfRange
      ? `Out of range (${min ?? 'any'} to ${max ?? 'any'})`
      : undefined);

  const clamp = (next: number): number => {
    if (min !== undefined && next < min) return min;
    if (max !== undefined && next > max) return max;
    return next;
  };

  const handleChange = (raw: string): void => {
    if (raw === '') {
      onChange(min ?? 0);
      return;
    }
    const next = Number(raw);
    if (Number.isNaN(next)) return;
    onChange(clamp(next));
  };

  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="numeric"
        aria-invalid={Boolean(message)}
        className={`input input-bordered w-full ${message ? 'input-error' : ''}`}
        value={value}
        min={min}
        max={max}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => handleChange(e.target.value)}
      />
      {message ? (
        <p className="text-error text-xs">{message}</p>
      ) : (
        hint && <p className="text-base-content/50 text-xs">{hint}</p>
      )}
    </div>
  );
};
