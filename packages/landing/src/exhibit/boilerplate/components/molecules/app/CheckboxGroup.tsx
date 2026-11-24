import type { FC } from 'react';
import { Checkbox } from '../../atoms/auth/Checkbox';

interface CheckboxOption {
  label: string;
  value: string;
  description?: string;
}

interface CheckboxGroupProps {
  options: CheckboxOption[];
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  inline?: boolean;
}

export const CheckboxGroup: FC<CheckboxGroupProps> = ({
  options,
  value,
  onChange,
  label,
  error,
  disabled = false,
  inline = false,
}) => {
  const toggle = (optionValue: string) => {
    const next = value.includes(optionValue)
      ? value.filter((item) => item !== optionValue)
      : [...value, optionValue];
    onChange(next);
  };

  return (
    <fieldset className="flex flex-col gap-2">
      {label && <legend className="text-sm font-medium">{label}</legend>}
      <div className={inline ? 'flex flex-wrap gap-4' : 'flex flex-col'}>
        {options.map((option) => (
          <div key={option.value}>
            <Checkbox
              label={option.label}
              checked={value.includes(option.value)}
              onChange={() => toggle(option.value)}
              disabled={disabled}
            />
            {option.description && (
              <p className="text-base-content/50 ml-7 text-xs">
                {option.description}
              </p>
            )}
          </div>
        ))}
      </div>
      {error && <span className="text-error text-xs">{error}</span>}
    </fieldset>
  );
};
