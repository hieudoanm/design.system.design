'use client';

import { useState } from 'react';
import type { FC, FormEvent } from 'react';

interface SubscribeFormProps {
  onSubmit: (email: string) => void;
  title?: string;
  description?: string;
  buttonLabel?: string;
}

export const SubscribeForm: FC<SubscribeFormProps> = ({
  onSubmit,
  title = 'Subscribe to our newsletter',
  description = 'Get the latest posts delivered to your inbox.',
  buttonLabel = 'Subscribe',
}) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setEmail('');
  };

  return (
    <form
      data-testid="subscribe-form"
      className="card bg-base-200"
      onSubmit={handleSubmit}>
      <div className="card-body">
        <h3 className="card-title">{title}</h3>
        {description && (
          <p className="text-base-content/70 text-sm">{description}</p>
        )}
        <div className="form-control w-full">
          <label className="label" htmlFor="subscribe-email">
            <span className="label-text">Email</span>
          </label>
          <input
            id="subscribe-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input input-bordered w-full"
          />
        </div>
        <div className="card-actions mt-2">
          <button
            type="submit"
            disabled={!email.trim()}
            className="btn btn-primary w-full">
            {buttonLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

SubscribeForm.displayName = 'SubscribeForm';
