'use client';

import type { FC } from 'react';
import { useState } from 'react';
import { FiCheckCircle, FiMail, FiSend } from 'react-icons/fi';

type SignupStatus = 'idle' | 'error' | 'success';

export const NewsletterSignupTemplate: FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<SignupStatus>('idle');
  const [message, setMessage] = useState('');

  const handleSubscribe = () => {
    const trimmed = email.trim();
    if (trimmed === '') {
      setStatus('error');
      setMessage('Enter an email address');
      return;
    }
    if (!trimmed.includes('@')) {
      setStatus('error');
      setMessage('Enter a valid email');
      return;
    }
    setStatus('success');
    setMessage('Subscribed');
  };

  return (
    <div className="bg-base-100 text-base-content min-h-dvh">
      <header className="border-base-content/10 border-b px-6 py-5">
        <h1 className="text-2xl font-bold tracking-tight">Newsletter</h1>
        <p className="text-base-content/50 mt-1 text-sm">
          Get the day's news in your inbox.
        </p>
      </header>

      <main className="mx-auto w-full max-w-4xl p-6">
        <div className="card bg-base-200 border-base-content/10 border">
          <div className="card-body flex flex-col gap-4 p-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="bg-primary text-primary-content flex h-12 w-12 items-center justify-center rounded-full">
                <FiMail className="h-6 w-6" />
              </div>
              <p className="text-base-content/50 text-sm">
                One email a day. No spam, ever.
              </p>
            </div>

            {status === 'success' ? (
              <div className="alert alert-success flex items-center gap-2">
                <FiCheckCircle className="h-4 w-4" />
                {message}
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    aria-label="Email address"
                    className="input input-bordered input-sm w-full"
                  />
                  <button
                    onClick={handleSubscribe}
                    className="btn btn-primary btn-sm gap-1">
                    <FiSend className="h-3.5 w-3.5" />
                    Subscribe
                  </button>
                </div>
                {status === 'error' && (
                  <p className="text-error mt-1 text-sm" role="alert">
                    {message}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

NewsletterSignupTemplate.displayName = 'NewsletterSignupTemplate';
