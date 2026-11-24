import type { FC } from 'react';

interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClass: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'select-sm',
  md: '',
  lg: 'select-lg',
};

export const Select: FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder,
  size = 'md',
  disabled = false,
}) => (
  <label className="flex flex-col gap-1">
    <span className="text-sm font-medium">{label}</span>
    <select
      className={`select select-bordered w-full ${sizeClass[size]}`}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </label>
);
