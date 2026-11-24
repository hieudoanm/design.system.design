'use client';

import type { FC, ReactNode } from 'react';
import { Children, cloneElement, isValidElement } from 'react';

interface ValidatorProps {
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export const Validator: FC<ValidatorProps> = ({
  hint,
  error,
  className = '',
  children,
}) => {
  const child = Children.only(children) as React.ReactElement<{
    className?: string;
    'aria-invalid'?: boolean;
  }>;
  const decorated =
    isValidElement(child) && child.type !== 'textarea'
      ? cloneElement(child, {
          className: [child.props.className, 'validator']
            .filter(Boolean)
            .join(' '),
          'aria-invalid': error ? true : undefined,
        })
      : child;

  return (
    <div className={className}>
      {decorated}
      <span className={`validator-hint ${error ? 'text-error' : ''}`}>
        {error ?? hint}
      </span>
    </div>
  );
};

Validator.displayName = 'Validator';
