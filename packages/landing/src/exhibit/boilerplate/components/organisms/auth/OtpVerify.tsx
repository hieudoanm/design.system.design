'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface OtpVerifyProps {
  digits?: number;
  onSubmit: (code: string) => void;
  loading?: boolean;
  error?: string;
  onResend?: () => void;
}

export const OtpVerify: FC<OtpVerifyProps> = ({
  digits = 6,
  onSubmit,
  loading = false,
  error,
  onResend,
}) => {
  const [code, setCode] = useState('');

  const updateDigit = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, '').slice(-1);
    const next = code.split('');
    next[index] = digit;
    setCode(next.join('').slice(0, digits));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || code.length !== digits) return;
    onSubmit(code);
  };

  const complete = code.length === digits;

  return (
    <form
      data-testid="otp-form"
      className="flex flex-col items-center gap-4"
      onSubmit={submit}>
      <div className="flex flex-col items-center gap-1">
        <h2 className="text-xl">Verify your identity</h2>
        <p className="text-base-content/50 text-sm">
          Enter the {digits}-digit code sent to your device.
        </p>
      </div>
      <div className="flex gap-2">
        {Array.from({ length: digits }, (_, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={2}
            aria-label={`Digit ${index + 1}`}
            value={code[index] ?? ''}
            onChange={(e) => updateDigit(index, e.target.value)}
            className="input input-bordered w-12 text-center"
          />
        ))}
      </div>
      {error && <span className="text-error text-sm">{error}</span>}
      <button
        type="submit"
        data-testid="otp-submit"
        className="btn btn-primary w-full"
        disabled={loading || !complete}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Verifying…' : 'Verify'}
      </button>
      {onResend && (
        <button
          type="button"
          data-testid="otp-resend"
          className="btn btn-link btn-sm"
          onClick={onResend}>
          Resend code
        </button>
      )}
    </form>
  );
};
