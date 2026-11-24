'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface MfaSetupProps {
  secret?: string;
  onSubmit?: (code: string) => void;
  loading?: boolean;
  error?: string;
}

const QR_SIZE = 8;

export const MfaSetup: FC<MfaSetupProps> = ({
  secret = 'JBSWY3DPEHPK3PXP',
  onSubmit,
  loading = false,
  error,
}) => {
  const [step, setStep] = useState<'scan' | 'verify'>('scan');
  const [code, setCode] = useState('');

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || code.length !== 6) return;
    onSubmit?.(code);
  };

  return (
    <div data-testid="mfa-setup" className="flex flex-col gap-4">
      <h2 className="text-xl">Set up two-factor authentication</h2>
      {step === 'scan' ? (
        <>
          <p className="text-base-content/50 text-sm">
            Scan the QR code with your authenticator app, or enter the key
            manually.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <div
              data-testid="mfa-qr"
              role="img"
              aria-label="QR code placeholder"
              className="border-base-300 grid grid-cols-8 gap-0.5 rounded-lg border p-2">
              {Array.from({ length: QR_SIZE * QR_SIZE }, (_, index) => {
                const filled =
                  (index * 7 + Math.floor(index / QR_SIZE) * 3) % 5 < 2;
                return (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 ${
                      filled ? 'bg-base-content' : 'bg-base-200'
                    }`}
                  />
                );
              })}
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-base-content/50 text-xs">
                Manual entry key
              </span>
              <code className="text-sm break-all">{secret}</code>
            </div>
          </div>
          <button
            type="button"
            data-testid="mfa-continue"
            className="btn btn-primary w-full"
            onClick={() => setStep('verify')}>
            Continue
          </button>
        </>
      ) : (
        <form className="flex flex-col gap-4" onSubmit={submit}>
          <label className="form-control w-full">
            <span className="label-text mb-1">Verification code</span>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={code}
              placeholder="6-digit code"
              onChange={(e) =>
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
              }
              className="input input-bordered w-full text-center tracking-[0.5em]"
            />
          </label>
          {error && <span className="text-error text-sm">{error}</span>}
          <button
            type="submit"
            data-testid="mfa-activate"
            className="btn btn-primary w-full"
            disabled={loading || code.length !== 6}>
            {loading && <span className="loading loading-spinner loading-sm" />}
            {loading ? 'Verifying…' : 'Activate'}
          </button>
          <button
            type="button"
            data-testid="mfa-back"
            className="btn btn-ghost w-full"
            onClick={() => setStep('scan')}>
            Back
          </button>
        </form>
      )}
    </div>
  );
};
