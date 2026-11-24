'use client';

import type { FC, ReactNode } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiHome, FiArrowLeft } from 'react-icons/fi';

interface ErrorTemplateProps {
  code?: string | number;
  description?: string;
  action?: ReactNode;
  variant?: 'error' | 'not-found';
}

export const ErrorTemplate: FC<ErrorTemplateProps> = ({
  variant = 'error',
  code = 404,
  description,
  action,
}) => {
  const notFound = variant === 'not-found';
  const descriptionText =
    description ?? (notFound ? 'Page not found' : undefined);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-8 px-6 text-center">
      <div>
        <p className="text-primary mb-2 text-xs tracking-[0.2em] uppercase">
          {notFound ? `Error ${code}` : 'Error'}
        </p>
        <h1
          className={`mb-3 ${
            notFound ? 'text-6xl font-black tracking-tight md:text-8xl' : ''
          }`}>
          {code}
        </h1>
        {descriptionText && (
          <p className="text-base-content/50 mx-auto max-w-sm text-sm">
            {descriptionText}
          </p>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {action ??
          (notFound ? (
            <>
              <Link href="/" className="btn btn-primary gap-2">
                <FiHome className="h-4 w-4" />
                Go home
              </Link>
              <button
                onClick={() => window.history.back()}
                className="btn btn-ghost gap-2">
                <FiArrowLeft className="h-4 w-4" />
                Go back
              </button>
            </>
          ) : null)}
      </div>
    </div>
  );
};

ErrorTemplate.displayName = 'ErrorTemplate';
