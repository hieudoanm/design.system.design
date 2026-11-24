'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface NewsletterSignupProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onSubscribe?: (email: string) => void;
}

export const NewsletterSignup: FC<NewsletterSignupProps> = ({
  title = 'Get the daily briefing',
  description = 'Top headlines in your inbox every morning.',
  buttonLabel = 'Subscribe',
  onSubscribe,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const submit = () => {
    if (!email.trim()) return;
    onSubscribe?.(email.trim());
    setSubscribed(true);
  };

  return (
    <section
      data-testid="newsletter-signup"
      className="card bg-primary text-primary-content border-primary-content/10 rounded-xl border">
      <div className="card-body items-center text-center">
        <h2>{title}</h2>
        <p className="text-primary-content/70 max-w-md">{description}</p>
        {subscribed ? (
          <p data-testid="newsletter-success" className="badge badge-success">
            You&apos;re subscribed!
          </p>
        ) : (
          <form
            className="mt-2 flex w-full max-w-md gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              submit();
            }}>
            <input
              type="email"
              required
              aria-label="Email address"
              data-testid="newsletter-input"
              className="input input-bordered input-sm flex-1"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-secondary btn-sm">
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
