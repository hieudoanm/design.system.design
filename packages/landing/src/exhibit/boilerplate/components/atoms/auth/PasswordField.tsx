'use client';

import { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import type { FC } from 'react';

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  autoComplete?: string;
}

export const PasswordField: FC<PasswordFieldProps> = ({
  label,
  value,
  onChange,
  error,
  placeholder,
  disabled = false,
  autoComplete = 'current-password',
}) => {
  const [visible, setVisible] = useState(false);
  const id = label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div
        className={`flex w-full items-center gap-2 ${disabled ? 'opacity-60' : ''}`}>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button"
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="btn btn-ghost btn-square btn-sm"
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}>
          {visible ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && <span className="text-error text-xs">{error}</span>}
    </div>
  );
};
