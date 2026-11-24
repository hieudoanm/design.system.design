'use client';

import { useRef } from 'react';
import type { FC } from 'react';

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  disabled?: boolean;
}

export const OTPInput: FC<OTPInputProps> = ({
  value,
  onChange,
  length = 6,
  label,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const digits = value.slice(0, length).padEnd(length, '\u00A0');

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium">{label}</span>}
      <div className="flex gap-2">
        {digits.split('').map((digit, index) => (
          <div
            key={index}
            aria-label={`Digit ${index + 1}`}
            className="border-base-300 bg-base-100 flex h-12 w-10 items-center justify-center rounded-lg border text-lg font-semibold">
            {digit}
          </div>
        ))}
      </div>
      <input
        ref={inputRef}
        role="textbox"
        aria-label={label ?? 'One-time code'}
        className="sr-only"
        value={value}
        maxLength={length}
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="one-time-code"
        disabled={disabled}
        onChange={(e) => {
          const next = e.target.value.replace(/\D/g, '').slice(0, length);
          onChange(next);
        }}
      />
    </div>
  );
};
