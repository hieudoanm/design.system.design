'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiMail, FiCheck, FiArrowRight } from 'react-icons/fi';
import { PageShell } from '@/exhibit/boilerplate/components/templates/shared/PageShell';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREQUENCIES = ['Weekly', 'Daily', 'Monthly'];

export const BlogNewsletterTemplate: FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [frequency, setFrequency] = useState('Weekly');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = () => {
    if (!EMAIL_REGEX.test(email)) {
      setError('Enter a valid email');
      return;
    }
    setError(null);
    setSubscribed(true);
  };

  const handleUnsubscribe = () => {
    setSubscribed(false);
    setEmail('');
    setError(null);
  };

  return (
    <PageShell
      title="Newsletter"
      subtitle="Stay up to date"
      backHref="/blog"
      maxWidth="max-w-2xl"
      gap="gap-8">
      {subscribed ? (
        <section className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border p-10 text-center">
          <div className="bg-success text-success-content flex h-12 w-12 items-center justify-center rounded-full">
            <FiCheck className="h-6 w-6" />
          </div>
          <h2 className="text-2xl">You&apos;re subscribed!</h2>
          <p className="text-base-content/60 text-sm">
            Updates will land in your inbox at <strong>{email}</strong>.
          </p>
          <div className="flex flex-col items-center gap-1.5">
            <label htmlFor="frequency" className="text-sm">
              Manage preferences
            </label>
            <select
              id="frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="select select-bordered select-sm">
              {FREQUENCIES.map((freq) => (
                <option key={freq} value={freq}>
                  {freq}
                </option>
              ))}
            </select>
          </div>
          <p className="text-base-content/40 text-xs">
            Newsletter frequency: {frequency}
          </p>
          <button onClick={handleUnsubscribe} className="btn btn-ghost btn-sm">
            Unsubscribe
          </button>
        </section>
      ) : (
        <section className="border-base-content/10 bg-base-200 rounded-2xl border p-10">
          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center rounded-full">
              <FiMail className="h-6 w-6" />
            </div>
            <h2 className="text-2xl">Subscribe to the newsletter</h2>
            <p className="text-base-content/50 text-sm">
              Get the latest posts delivered to your inbox.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <FiMail className="text-base-content/30 absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email"
                className="input input-bordered w-full pl-9"
              />
            </div>
            <button
              onClick={handleSubscribe}
              className="btn btn-primary gap-1.5">
              <FiArrowRight className="h-4 w-4" />
              Subscribe
            </button>
          </div>
          {error && (
            <p className="text-error mt-3 text-sm" role="alert">
              {error}
            </p>
          )}
        </section>
      )}
    </PageShell>
  );
};

BlogNewsletterTemplate.displayName = 'BlogNewsletterTemplate';
