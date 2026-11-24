import type { FC } from 'react';

interface RadioProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const sizeClass: Record<NonNullable<RadioProps['size']>, string> = {
  sm: 'radio-sm',
  md: '',
  lg: 'radio-lg',
};

export const Radio: FC<RadioProps> = ({
  label,
  name,
  checked,
  onChange,
  size = 'md',
  disabled = false,
}) => (
  <label
    className={`label flex cursor-pointer gap-2 ${disabled ? 'opacity-60' : ''}`}>
    <input
      type="radio"
      name={name}
      className={`radio radio-primary ${sizeClass[size]}`}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
    <span className="label-text">{label}</span>
  </label>
);
