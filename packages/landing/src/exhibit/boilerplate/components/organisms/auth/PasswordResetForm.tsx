'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface PasswordResetFormProps {
  onSubmit: (email: string) => void;
  loading?: boolean;
  error?: string;
  successMessage?: string;
}

export const PasswordResetForm: FC<PasswordResetFormProps> = ({
  onSubmit,
  loading = false,
  error,
  successMessage = 'Check your inbox for a reset link.',
}) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    onSubmit(email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div
        data-testid="reset-success"
        className="card bg-base-100 border-base-200 border shadow-sm">
        <div className="card-body items-center text-center">
          <span className="badge badge-success badge-lg">✓</span>
          <h2 className="card-title">Request sent</h2>
          <p className="text-base-content/60 text-sm">{successMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <form
      data-testid="reset-form"
      noValidate
      className="flex flex-col gap-4"
      onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">Reset your password</h2>
        <p className="text-base-content/50 text-sm">
          Enter your email and we will send you a reset link.
        </p>
      </div>
      <label className="form-control w-full">
        <span className="label-text mb-1">Email</span>
        <input
          type="email"
          value={email}
          placeholder="you@example.com"
          autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
      {error && <span className="text-error text-sm">{error}</span>}
      <button
        type="submit"
        data-testid="reset-submit"
        className="btn btn-primary w-full"
        disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Sending…' : 'Send reset link'}
      </button>
    </form>
  );
};
