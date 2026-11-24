import type { FC } from 'react';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClass: Record<NonNullable<CheckboxProps['size']>, string> = {
  sm: 'checkbox-sm',
  md: '',
  lg: 'checkbox-lg',
};

export const Checkbox: FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  size = 'md',
  disabled = false,
}) => (
  <label
    className={`label flex cursor-pointer gap-2 ${disabled ? 'opacity-60' : ''}`}>
    <input
      type="checkbox"
      className={`checkbox checkbox-primary ${sizeClass[size]}`}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="label-text">{label}</span>
  </label>
);
