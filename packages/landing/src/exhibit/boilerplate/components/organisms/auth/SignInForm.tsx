'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface SignInFormProps {
  onSubmit: (payload: { email: string; password: string }) => void;
  loading?: boolean;
  error?: string;
  title?: string;
  onForgotPassword?: () => void;
}

export const SignInForm: FC<SignInFormProps> = ({
  onSubmit,
  loading = false,
  error,
  title = 'Sign in to your account',
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    onSubmit({ email, password });
  };

  return (
    <form
      data-testid="signin-form"
      noValidate
      className="flex flex-col gap-4"
      onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">{title}</h2>
        <p className="text-base-content/50 text-sm">Welcome back.</p>
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
      <label className="form-control w-full">
        <span className="label-text mb-1">Password</span>
        <input
          type="password"
          value={password}
          placeholder="••••••••"
          autoComplete="current-password"
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
      {onForgotPassword && (
        <button
          type="button"
          data-testid="forgot-password"
          onClick={onForgotPassword}
          className="text-primary self-end text-sm">
          Forgot password?
        </button>
      )}
      {error && <span className="text-error text-sm">{error}</span>}
      <button
        type="submit"
        data-testid="signin-submit"
        className="btn btn-primary w-full"
        disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
};
