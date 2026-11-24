'use client';

import type { FC } from 'react';

interface ButtonGroupOption {
  label: string;
  value: string;
}

interface ButtonGroupProps {
  options: ButtonGroupOption[];
  value: string;
  onChange: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export const ButtonGroup: FC<ButtonGroupProps> = ({
  options,
  value,
  onChange,
  orientation = 'horizontal',
  size = 'md',
  disabled = false,
}) => (
  <div
    className={`join ${
      orientation === 'vertical' ? 'join-vertical' : 'join-horizontal'
    }`}>
    {options.map((option) => (
      <button
        key={option.value}
        type="button"
        aria-pressed={option.value === value}
        className={`btn btn-${size} join-item ${
          option.value === value ? 'btn-primary' : ''
        }`}
        disabled={disabled}
        onClick={() => onChange(option.value)}>
        {option.label}
      </button>
    ))}
  </div>
);
