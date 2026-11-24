'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheck, FiMail } from 'react-icons/fi';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';

export const VerifyEmailTemplate: FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [newEmail, setNewEmail] = useState('');
  const [resent, setResent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleResend = () => {
    setResent(!resent);
  };

  const handleUpdateEmail = () => {
    if (!newEmail.trim()) {
      setEmailError('Enter an email address');
      return;
    }
    setEmail(newEmail);
    setEmailError(null);
    setResent(false);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      <Header title="Verify Email" backHref="/" />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          <div className="mb-8 flex flex-col items-center gap-2">
            <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
              <FiMail className="text-primary h-6 w-6" />
            </div>
            <h2 className="mt-2">Verify your email</h2>
            <p className="text-base-content/50 text-center text-sm">
              We sent a verification link to{' '}
              <span className="text-base-content font-medium">{email}</span>
            </p>
          </div>

          {resent && (
            <div className="alert alert-success mb-6 text-sm">
              <FiCheck size={16} />
              Verification email resent to {email}
            </div>
          )}

          {emailError && (
            <div className="alert alert-error mb-6 text-sm">{emailError}</div>
          )}

          <button
            type="button"
            onClick={handleResend}
            className="btn btn-outline w-full">
            Resend email
          </button>

          <div className="mt-6 flex flex-col gap-1">
            <label htmlFor="new-email" className="text-sm font-medium">
              Change email
            </label>
            <div className="flex gap-2">
              <input
                id="new-email"
                type="email"
                placeholder="new@example.com"
                className="input input-bordered w-full"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
              <button
                type="button"
                onClick={handleUpdateEmail}
                className="btn btn-primary">
                Update
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

VerifyEmailTemplate.displayName = 'VerifyEmailTemplate';
