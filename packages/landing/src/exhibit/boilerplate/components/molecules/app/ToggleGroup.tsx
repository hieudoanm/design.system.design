import type { FC } from 'react';

interface ToggleOption {
  label: string;
  value: string;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string[] | string;
  onChange: (value: string[] | string) => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export const ToggleGroup: FC<ToggleGroupProps> = ({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  className = '',
}) => {
  const handleToggle = (optionValue: string) => {
    if (multiple) {
      const current = value as string[];
      const next = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];
      onChange(next);
      return;
    }
    onChange(optionValue);
  };

  const isActive = (optionValue: string): boolean =>
    multiple
      ? (value as string[]).includes(optionValue)
      : value === optionValue;

  return (
    <div
      role="group"
      aria-label="Toggle group"
      className={`join ${disabled ? 'opacity-50' : ''} ${className}`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={isActive(option.value)}
          disabled={disabled}
          onClick={() => handleToggle(option.value)}
          className={`btn btn-sm join-item ${
            isActive(option.value) ? 'btn-primary' : 'btn-outline'
          }`}>
          {option.label}
        </button>
      ))}
    </div>
  );
};
