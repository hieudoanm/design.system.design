'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface AccountRecoveryProps {
  onSubmit: (payload: {
    method: 'email' | 'phone';
    identifier: string;
  }) => void;
  loading?: boolean;
  error?: string;
}

export const AccountRecovery: FC<AccountRecoveryProps> = ({
  onSubmit,
  loading = false,
  error,
}) => {
  const [method, setMethod] = useState<'email' | 'phone'>('email');
  const [identifier, setIdentifier] = useState('');

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading || identifier.trim() === '') return;
    onSubmit({ method, identifier: identifier.trim() });
  };

  return (
    <form
      data-testid="recovery-form"
      noValidate
      className="flex flex-col gap-4"
      onSubmit={submit}>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl">Recover your account</h2>
        <p className="text-base-content/50 text-sm">
          Choose how you want to receive a recovery link.
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          data-testid="method-email"
          aria-pressed={method === 'email'}
          onClick={() => setMethod('email')}
          className={`btn flex-1 ${method === 'email' ? 'btn-primary' : 'btn-outline'}`}>
          Email
        </button>
        <button
          type="button"
          data-testid="method-phone"
          aria-pressed={method === 'phone'}
          onClick={() => setMethod('phone')}
          className={`btn flex-1 ${method === 'phone' ? 'btn-primary' : 'btn-outline'}`}>
          Phone
        </button>
      </div>
      <label className="form-control w-full">
        <span className="label-text mb-1">
          {method === 'email' ? 'Email address' : 'Phone number'}
        </span>
        <input
          type={method === 'email' ? 'email' : 'tel'}
          value={identifier}
          placeholder={
            method === 'email' ? 'you@example.com' : '+1 555 000 1234'
          }
          onChange={(e) => setIdentifier(e.target.value)}
          className="input input-bordered w-full"
        />
      </label>
      {error && <span className="text-error text-sm">{error}</span>}
      <button
        type="submit"
        data-testid="recovery-submit"
        className="btn btn-primary w-full"
        disabled={loading}>
        {loading && <span className="loading loading-spinner loading-sm" />}
        {loading ? 'Sending…' : 'Send recovery link'}
      </button>
    </form>
  );
};
