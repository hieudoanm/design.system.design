'use client';

import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import type { FC } from 'react';

interface CookieBannerProps {
  onAccept: () => void;
  onDecline: () => void;
  message?: string;
  policyHref?: string;
  policyLabel?: string;
}

export const CookieBanner: FC<CookieBannerProps> = ({
  onAccept,
  onDecline,
  message = 'We use cookies to improve your experience.',
  policyHref = '/landing/privacy',
  policyLabel = 'Privacy policy',
}) => {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div className="bg-base-100 border-base-content/10 fixed inset-x-0 bottom-0 z-40 flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        {message}{' '}
        <Link
          href={policyHref}
          className="text-primary font-medium underline underline-offset-2">
          {policyLabel}
        </Link>
      </p>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            setHidden(true);
            onDecline();
          }}>
          Decline
        </button>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            setHidden(true);
            onAccept();
          }}>
          Accept
        </button>
      </div>
    </div>
  );
};
