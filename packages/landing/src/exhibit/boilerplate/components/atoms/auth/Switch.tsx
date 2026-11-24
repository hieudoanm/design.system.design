import type { FC } from 'react';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  description?: string;
}

const sizeClass: Record<NonNullable<SwitchProps['size']>, string> = {
  sm: 'toggle-sm',
  md: '',
  lg: 'toggle-lg',
};

export const Switch: FC<SwitchProps> = ({
  label,
  checked,
  onChange,
  size = 'md',
  disabled = false,
  description,
}) => (
  <label className="label flex cursor-pointer gap-2">
    <span className="flex flex-col gap-0.5">
      <span className="label-text">{label}</span>
      {description && (
        <span className="label-text-alt text-base-content/50">
          {description}
        </span>
      )}
    </span>
    <input
      type="checkbox"
      role="switch"
      className={`toggle toggle-primary ${sizeClass[size]}`}
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange(e.target.checked)}
    />
  </label>
);
