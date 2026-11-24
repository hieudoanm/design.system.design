import type { FC } from 'react';

interface EmailCountProps {
  count: number;
  label?: string;
  className?: string;
}

export const EmailCount: FC<EmailCountProps> = ({
  count,
  label = 'emails',
  className = '',
}) => (
  <span
    data-testid="email-count"
    className={`text-base-content/60 text-sm ${className}`}>
    {count} {label}
  </span>
);
