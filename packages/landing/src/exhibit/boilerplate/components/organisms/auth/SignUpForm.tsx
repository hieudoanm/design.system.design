'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface SignUpFormProps {
  onSubmit: (payload: {
    name: string;
    email: string;
    password: string;
  }) => void;
  loading?: boolean;
  error?: string;
  title?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignUpForm: FC<SignUpFormProps> = ({
  onSubmit,
  loading = false,
  error,
  title = 'Create your account',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState<string | undefined>(
    undefined
  );

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (
      name.trim() === '' ||
      !EMAIL_PATTERN.test(email) ||
      password.length < 8
    ) {
      setValidationError(
        'A name, a valid email, and a password of at least 8 characters are required.'
      );
      return;
    }
    setValidationError(undefined);
    onSubmit({ name: name.trim(), email, password });
  };

  return (
    <form
      data-testid="signup-form"
      noValidate
      className="flex flex-col gap-4"
      onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">{title}</h2>
        <p className="text-base-content/50 text-sm">Start your free trial.</p>
      </div>
      <label className="form-control w-full">
        <span className="label-text mb-1">Full name</span>
        <input
          type="text"
          value={name}
          placeholder="Jane Doe"
          autoComplete="name"
          onChange={(e) => setName(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
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
          placeholder="At least 8 characters"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
      {(validationError ?? error) && (
        <span className="text-error text-sm">{validationError ?? error}</span>
      )}
      <button
        type="submit"
        data-testid="signup-submit"
        className="btn btn-primary w-full"
        disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Creating account…' : 'Create account'}
      </button>
    </form>
  );
};
