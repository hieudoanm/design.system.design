import type { FC, ReactNode } from 'react';

interface InputGroupProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  placeholder?: string;
  type?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  id?: string;
}

export const InputGroup: FC<InputGroupProps> = ({
  value,
  onChange,
  label,
  leading,
  trailing,
  placeholder,
  type = 'text',
  error,
  hint,
  disabled = false,
  id,
}) => {
  const inputId =
    id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium">
          {label}
        </label>
      )}
      <div className="join w-full">
        {leading && (
          <span className="join-item btn btn-outline btn-disabled">
            {leading}
          </span>
        )}
        <input
          id={inputId}
          type={type}
          className={`input input-bordered join-item w-full ${error ? 'input-error' : ''}`}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
        {trailing && (
          <span className="join-item btn btn-outline btn-disabled">
            {trailing}
          </span>
        )}
      </div>
      {error ? (
        <span className="text-error text-xs">{error}</span>
      ) : (
        hint && <span className="text-base-content/50 text-xs">{hint}</span>
      )}
    </div>
  );
};
