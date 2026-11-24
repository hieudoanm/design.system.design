'use client';

import { useEffect, useState } from 'react';
import type { FC } from 'react';

interface SessionTimeoutProps {
  timeoutSeconds?: number;
  warningThresholdSeconds?: number;
  onSignOut: () => void;
  onExtend: () => void;
}

const formatRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${String(rest).padStart(2, '0')}`;
};

export const SessionTimeout: FC<SessionTimeoutProps> = ({
  timeoutSeconds = 300,
  warningThresholdSeconds = 60,
  onSignOut,
  onExtend,
}) => {
  const [remaining, setRemaining] = useState(timeoutSeconds);

  useEffect(() => {
    const interval = setInterval(
      () => setRemaining((value) => value - 1),
      1000
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (remaining === 0) onSignOut();
  }, [remaining, onSignOut]);

  if (remaining <= 0) return null;

  const warning = remaining <= warningThresholdSeconds;

  const extend = () => {
    setRemaining(timeoutSeconds);
    onExtend();
  };

  return (
    <div
      data-testid="session-timeout"
      className={`fixed inset-x-0 bottom-0 z-50 border-t p-4 shadow-lg ${
        warning
          ? 'border-warning/30 bg-warning/10'
          : 'border-base-200 bg-base-100'
      }`}>
      <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-3">
        <span
          className={`badge badge-lg ${
            warning ? 'badge-warning' : 'badge-primary'
          }`}>
          {warning ? 'Session expiring' : 'Session active'}
        </span>
        <p className="flex-1 text-sm">
          Your session expires in <strong>{formatRemaining(remaining)}</strong>.
        </p>
        <button
          type="button"
          data-testid="session-extend"
          className="btn btn-outline btn-sm"
          onClick={extend}>
          Extend session
        </button>
        <button
          type="button"
          data-testid="session-signout"
          className="btn btn-error btn-sm"
          onClick={onSignOut}>
          Sign out
        </button>
      </div>
    </div>
  );
};
