'use client';

import type { FC } from 'react';
import { useState } from 'react';
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiCheck,
  FiArrowLeft,
} from 'react-icons/fi';
import Link from '@/exhibit/boilerplate/link';
import { Header } from '@/exhibit/boilerplate/components/organisms/support/Header';
import { TextField } from '@/exhibit/boilerplate/components/atoms/auth/TextField';
import { Spinner } from '@/exhibit/boilerplate/components/atoms/support/Spinner';

export type PasswordResetMode = 'request' | 'confirm';

interface PasswordResetTemplateProps {
  mode?: PasswordResetMode;
  onSubmit: (value: string) => void | Promise<void>;
  error?: string;
  success?: boolean;
  loading?: boolean;
}

export const PasswordResetTemplate: FC<PasswordResetTemplateProps> = ({
  mode = 'request',
  onSubmit,
  error,
  success = false,
  loading = false,
}) => {
  const isRequest = mode === 'request';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldError(null);

    if (isRequest) {
      onSubmit(email);
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters');
      return;
    }

    onSubmit(password);
  };

  const displayError = fieldError ?? error;

  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    {
      label: 'Contains a lowercase letter',
      met: /[a-z]/.test(password),
    },
    {
      label: 'Contains an uppercase letter',
      met: /[A-Z]/.test(password),
    },
  ];

  return (
    <div className="flex min-h-dvh flex-col">
      <Header
        title={isRequest ? 'Forgot Password' : 'Reset Password'}
        backHref="/"
      />

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center p-6">
        <div className="border-base-content/10 bg-base-200 rounded-2xl border p-8">
          {success ? (
            <div className="flex flex-col items-center gap-4">
              <div className="bg-success/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                {isRequest ? (
                  <FiMail className="text-success h-6 w-6" />
                ) : (
                  <FiCheck className="text-success h-6 w-6" />
                )}
              </div>
              {isRequest ? (
                <>
                  <h2 className="mt-2">Check your email</h2>
                  <p className="text-base-content/50 text-center text-sm">
                    We&apos;ve sent a password reset link to{' '}
                    <span className="text-base-content font-medium">
                      {email}
                    </span>
                  </p>
                  <Link
                    href="/auth/sign-in"
                    className="btn btn-ghost btn-sm mt-4">
                    <FiArrowLeft />
                    Back to sign in
                  </Link>
                </>
              ) : (
                <>
                  <h2 className="mt-2">Password reset</h2>
                  <p className="text-base-content/50 text-center text-sm">
                    Your password has been successfully reset.
                  </p>
                  <Link href="/auth/sign-in" className="btn btn-primary mt-4">
                    Sign in with new password
                  </Link>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-col items-center gap-2">
                <div className="bg-primary/10 flex h-14 w-14 items-center justify-center rounded-2xl">
                  {isRequest ? (
                    <FiMail className="text-primary h-6 w-6" />
                  ) : (
                    <FiLock className="text-primary h-6 w-6" />
                  )}
                </div>
                {isRequest ? (
                  <>
                    <h2 className="mt-2">Forgot password?</h2>
                    <p className="text-base-content/50 text-center text-sm">
                      No worries. Enter your email and we&apos;ll send you a
                      reset link.
                    </p>
                  </>
                ) : (
                  <>
                    <h2 className="mt-2">Set new password</h2>
                    <p className="text-base-content/50 text-center text-sm">
                      Your new password must be different from previously used
                      passwords.
                    </p>
                  </>
                )}
              </div>

              {displayError && (
                <div className="alert alert-error mb-6 text-sm">
                  {displayError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {isRequest ? (
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <label htmlFor="password" className="text-sm font-medium">
                        New password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="At least 8 characters"
                          className="input input-bordered w-full pr-10"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={8}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-base-content/40 hover:text-base-content absolute top-1/2 right-3 -translate-y-1/2">
                          {showPassword ? (
                            <FiEyeOff size={18} />
                          ) : (
                            <FiEye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label
                        htmlFor="confirm-password"
                        className="text-sm font-medium">
                        Confirm new password
                      </label>
                      <input
                        id="confirm-password"
                        type="password"
                        placeholder="Repeat your new password"
                        className="input input-bordered w-full"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>

                    <div className="border-base-content/10 rounded-xl border p-4">
                      <p className="text-base-content/50 mb-2 text-xs tracking-[0.2em] uppercase">
                        Requirements
                      </p>
                      <ul className="flex flex-col gap-1.5">
                        {requirements.map(({ label, met }) => (
                          <li
                            key={label}
                            className={`flex items-center gap-2 text-xs ${
                              met ? 'text-success' : 'text-base-content/40'
                            }`}>
                            <span>{met ? '✓' : '○'}</span>
                            {label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="btn btn-primary mt-2 w-full"
                  disabled={loading}>
                  {loading ? <Spinner size="sm" /> : null}
                  {loading
                    ? isRequest
                      ? 'Sending...'
                      : 'Resetting...'
                    : isRequest
                      ? 'Send reset link'
                      : 'Reset password'}
                </button>
              </form>

              {isRequest && (
                <Link
                  href="/auth/sign-in"
                  className="text-base-content/50 mt-6 flex items-center justify-center gap-2 text-sm hover:underline">
                  <FiArrowLeft />
                  Back to sign in
                </Link>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

PasswordResetTemplate.displayName = 'PasswordResetTemplate';
