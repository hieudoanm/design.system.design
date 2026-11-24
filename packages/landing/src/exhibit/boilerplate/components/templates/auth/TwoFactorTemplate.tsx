'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiKey, FiShield } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

export const TwoFactorTemplate: FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [resent, setResent] = useState(false);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Code must be 6 digits');
      return;
    }
    setError(null);
    setVerified(true);
  };

  const handleResend = () => {
    setResent(!resent);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Two-Factor Authentication" backHref="/" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          {verified ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-success/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                <FiShield className="text-success h-6 w-6" />
              </div>
              <h2 className="mt-2">Two-factor authentication enabled</h2>
              <p className="text-base-content/50 text-center text-sm">
                Your account is now protected with two-factor authentication.
              </p>
              <span className="badge badge-success">Verified</span>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center gap-2">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  <FiKey className="text-primary h-6 w-6" />
                </div>
                <h2 className="mt-2">Enter your code</h2>
                <p className="text-base-content/50 text-center text-sm">
                  Enter the 6-digit code sent to your device.
                </p>
              </div>

              {error && (
                <div className="alert alert-error mb-6 text-sm">{error}</div>
              )}

              {resent && (
                <div className="alert alert-success mb-6 text-sm">
                  <FiCheck size={16} />A new code was sent to your device
                </div>
              )}

              <form onSubmit={handleVerify} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1">
                  <label htmlFor="otp-code" className="text-sm font-medium">
                    Verification code
                  </label>
                  <input
                    id="otp-code"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="123456"
                    className="input input-bordered w-full text-center text-lg tracking-[0.4em]"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                </div>

                <button type="submit" className="btn btn-primary w-full">
                  Verify
                </button>

                <p className="text-base-content/50 text-center text-xs">
                  Your code expires in 5 minutes.
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  className="btn btn-ghost btn-sm w-full">
                  Resend code
                </button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

TwoFactorTemplate.displayName = 'TwoFactorTemplate';
