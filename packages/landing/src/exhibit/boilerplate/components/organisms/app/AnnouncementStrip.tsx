'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface AnnouncementAction {
  label: string;
  onClick: () => void;
}

interface AnnouncementStripProps {
  message: string;
  action?: AnnouncementAction;
  variant?: 'info' | 'success' | 'warning' | 'error';
  dismissible?: boolean;
  onDismiss?: () => void;
}

const STRIP_CLASS: Record<
  NonNullable<AnnouncementStripProps['variant']>,
  string
> = {
  info: 'bg-info/10 text-info',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
};

const BADGE_CLASS: Record<
  NonNullable<AnnouncementStripProps['variant']>,
  string
> = {
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
};

export const AnnouncementStrip: FC<AnnouncementStripProps> = ({
  message,
  action,
  variant = 'info',
  dismissible = false,
  onDismiss,
}) => {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  const dismiss = () => {
    setHidden(true);
    onDismiss?.();
  };

  return (
    <div
      data-testid="announcement-strip"
      className={`flex flex-wrap items-center gap-3 px-4 py-2.5 text-sm ${STRIP_CLASS[variant]}`}>
      <span className={`badge badge-sm ${BADGE_CLASS[variant]}`}>
        {variant}
      </span>
      <p className="flex-1">{message}</p>
      {action && (
        <button
          type="button"
          data-testid="announcement-action"
          onClick={action.onClick}
          className="btn btn-xs btn-outline">
          {action.label}
        </button>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss announcement"
          data-testid="announcement-dismiss"
          onClick={dismiss}
          className="btn btn-ghost btn-circle btn-xs">
          ✕
        </button>
      )}
    </div>
  );
};
