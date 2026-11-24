'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface NewsletterBannerProps {
  title?: string;
  description?: string;
  buttonLabel?: string;
  onSubscribe?: (email: string) => void;
}

export const NewsletterBanner: FC<NewsletterBannerProps> = ({
  title = 'Join the newsletter',
  description = 'Get the latest posts delivered to your inbox.',
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
    <section className="card bg-base-200 border-base-content/10 rounded-xl border">
      <div className="card-body items-center text-center">
        <h2>{title}</h2>
        <p className="text-base-content/60 max-w-md">{description}</p>
        {subscribed ? (
          <p data-testid="newsletter-success" className="badge badge-success">
            Subscribed!
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
              aria-label="Email address"
              data-testid="newsletter-input"
              className="input input-bordered input-sm flex-1"
              value={email}
              placeholder="you@example.com"
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="btn btn-primary btn-sm">
              {buttonLabel}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
