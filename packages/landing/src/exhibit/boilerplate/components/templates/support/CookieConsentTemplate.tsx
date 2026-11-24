'use client';

import type { FC } from 'react';
import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiAlertCircle, FiX } from 'react-icons/fi';

export const CookieConsentTemplate: FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-4">
      <div className="border-base-content/10 bg-base-200 mx-auto flex max-w-4xl items-start gap-4 rounded-2xl border p-5 shadow-2xl sm:items-center">
        <div className="bg-primary/10 text-primary hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg sm:flex">
          <FiAlertCircle className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">This site uses cookies</p>
          <p className="text-base-content/50 mt-0.5 text-xs leading-relaxed">
            We use cookies to improve your experience. By continuing, you agree
            to our{' '}
            <Link
              href="/landing/privacy"
              className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => setDismissed(true)}
            className="btn btn-primary btn-sm">
            Accept
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="btn btn-ghost btn-sm px-2">
            <FiX className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

CookieConsentTemplate.displayName = 'CookieConsentTemplate';
