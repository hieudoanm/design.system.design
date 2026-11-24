'use client';

import { FC } from 'react';

interface GlobalErrorTemplateProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export const GlobalErrorTemplate: FC<GlobalErrorTemplateProps> = ({
  reset,
}) => (
  <html lang="en">
    <body className="bg-base-100 text-base-content h-screen overflow-y-auto">
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <p className="text-base-content/50 mb-6 text-xs tracking-[0.2em] uppercase">
          Error
        </p>
        <p className="text-base-content/50 mb-10 max-w-sm text-center text-sm">
          Something went wrong.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button className="btn btn-primary btn-sm" onClick={() => reset()}>
            Try again
          </button>
        </div>
      </div>
    </body>
  </html>
);

GlobalErrorTemplate.displayName = 'GlobalErrorTemplate';
