import type { FC } from 'react';
import { Radio } from '../../atoms/auth/Radio';

interface RadioOption {
  label: string;
  value: string;
  description?: string;
}

interface RadioGroupProps {
  name: string;
  options: RadioOption[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  inline?: boolean;
}

export const RadioGroup: FC<RadioGroupProps> = ({
  name,
  options,
  value,
  onChange,
  label,
  error,
  disabled = false,
  inline = false,
}) => (
  <fieldset className="flex flex-col gap-2">
    {label && <legend className="text-sm font-medium">{label}</legend>}
    <div className={inline ? 'flex flex-wrap gap-4' : 'flex flex-col'}>
      {options.map((option) => (
        <div key={option.value}>
          <Radio
            label={option.label}
            name={name}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
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
