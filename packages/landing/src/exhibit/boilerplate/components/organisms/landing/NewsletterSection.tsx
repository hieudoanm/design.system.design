'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface NewsletterSectionProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onSubmit?: (email: string) => void;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const NewsletterSection: FC<NewsletterSectionProps> = ({
  title = 'Stay in the loop',
  description = 'Get product updates and news once a month.',
  buttonLabel = 'Subscribe',
  onSubmit,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [subscribed, setSubscribed] = useState(false);

  const submit = () => {
    if (!EMAIL_PATTERN.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError(undefined);
    setSubscribed(true);
    onSubmit?.(email);
  };

  return (
    <section className="bg-base-200 border-base-content/10 flex flex-col items-center gap-4 rounded-2xl border px-6 py-12 text-center">
      <h2 className="text-2xl">{title}</h2>
      <p className="text-base-content/60 max-w-md text-sm">{description}</p>
      {subscribed ? (
        <div role="status" className="badge badge-success badge-lg">
          Subscribed — check your inbox
        </div>
      ) : (
        <form
          noValidate
          className="flex w-full max-w-md flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}>
          <div className="flex flex-1 flex-col gap-1">
            <input
              aria-label="Email address"
              type="email"
              className={`input input-bordered w-full ${error ? 'input-error' : ''}`}
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && <span className="text-error text-xs">{error}</span>}
          </div>
          <button type="submit" className="btn btn-primary">
            {buttonLabel}
          </button>
        </form>
      )}
    </section>
  );
};
