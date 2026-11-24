'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiTool, FiBell, FiMail, FiCheck } from 'react-icons/fi';

export type LaunchStatusVariant = 'maintenance' | 'coming-soon';

interface LaunchStatusTemplateProps {
  variant?: LaunchStatusVariant;
}

export const LaunchStatusTemplate: FC<LaunchStatusTemplateProps> = ({
  variant = 'maintenance',
}) => {
  const isMaintenance = variant === 'maintenance';
  const [email, setEmail] = useState('');
  const [notified, setNotified] = useState(false);

  const handleNotify = () => {
    if (isMaintenance || email) setNotified(true);
  };

  return (
    <div className="flex min-h-dvh flex-col">
      {!isMaintenance && (
        <header className="border-base-300 bg-base-100/80 sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur-sm">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Boilerplate
          </Link>
          <Link href="/auth/sign-up" className="btn btn-primary btn-sm">
            Get early access
          </Link>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center gap-8 px-6 py-24 text-center">
        {isMaintenance ? (
          <>
            <div className="bg-primary/10 text-primary flex h-20 w-20 items-center justify-center rounded-2xl">
              <FiTool className="h-10 w-10" />
            </div>
            <p className="badge badge-neutral mb-4 rounded-full">
              Scheduled maintenance
            </p>
            <h1 className="mb-3 text-4xl md:text-5xl">
              We&apos;ll be back shortly
            </h1>
            <p className="text-base-content/50 mx-auto max-w-md text-sm leading-relaxed">
              We&apos;re performing scheduled maintenance to improve your
              experience. We appreciate your patience.
            </p>
          </>
        ) : (
          <>
            <span className="badge badge-neutral mb-6 rounded-full">
              Coming soon
            </span>
            <h1 className="mb-6 text-5xl md:text-7xl">
              Something great is coming
            </h1>
            <p className="text-base-content/50 mb-10 max-w-xl text-sm leading-relaxed">
              We&apos;re building something amazing. Join the waitlist to be the
              first to know when we launch.
            </p>
          </>
        )}

        {isMaintenance ? (
          <div className="border-base-content/10 bg-base-200 flex flex-col items-center gap-4 rounded-2xl border p-6">
            {notified ? (
              <div className="flex items-center gap-2 text-sm">
                <FiCheck className="text-success h-4 w-4" />
                <span>We&apos;ll email you when we&apos;re back.</span>
              </div>
            ) : (
              <>
                <p className="text-base-content/50 text-xs">
                  Get notified when we&apos;re back online
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="input input-bordered input-sm w-56"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    onClick={handleNotify}
                    className="btn btn-primary btn-sm gap-1">
                    <FiBell className="h-3.5 w-3.5" />
                    Notify me
                  </button>
                </div>
              </>
            )}
          </div>
        ) : notified ? (
          <div className="border-base-content/10 bg-base-200 flex items-center gap-3 rounded-xl border px-6 py-4">
            <FiCheck className="text-success h-5 w-5" />
            <span className="text-sm font-medium">
              You&apos;re on the list!
            </span>
          </div>
        ) : (
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="you@example.com"
              className="input input-bordered flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleNotify} className="btn btn-primary gap-2">
              <FiBell className="h-4 w-4" />
              Notify me
            </button>
          </div>
        )}

        {isMaintenance ? (
          <div className="flex gap-4">
            <Link href="/" className="btn btn-ghost btn-sm gap-2">
              <FiMail className="h-4 w-4" />
              Contact support
            </Link>
          </div>
        ) : (
          <div className="mt-16 flex items-center gap-8 text-xs">
            <span className="text-base-content/30">Launching soon</span>
            <span className="text-base-content/10">&middot;</span>
            <span className="text-base-content/30">Free tier available</span>
            <span className="text-base-content/10">&middot;</span>
            <span className="text-base-content/30">No spam, ever</span>
          </div>
        )}
      </main>

      {!isMaintenance && (
        <footer className="border-base-300 border-t px-6 py-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-base-content/50 text-xs">
              &copy; {new Date().getFullYear()} Boilerplate. All rights
              reserved.
            </p>
          </div>
        </footer>
      )}
    </div>
  );
};

LaunchStatusTemplate.displayName = 'LaunchStatusTemplate';
