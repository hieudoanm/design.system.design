'use client';

import { useState } from 'react';
import Link from '@/exhibit/boilerplate/link';
import { FiX } from 'react-icons/fi';
import type { FC } from 'react';

interface AnnouncementBarProps {
  text: string;
  link?: { label: string; href: string };
  variant?: 'primary' | 'accent' | 'neutral';
  dismissible?: boolean;
  onDismiss?: () => void;
}

const variantClass: Record<
  NonNullable<AnnouncementBarProps['variant']>,
  string
> = {
  primary: 'bg-primary text-primary-content',
  accent: 'bg-accent text-accent-content',
  neutral: 'bg-neutral text-neutral-content',
};

export const AnnouncementBar: FC<AnnouncementBarProps> = ({
  text,
  link,
  variant = 'primary',
  dismissible = false,
  onDismiss,
}) => {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div
      className={`flex w-full items-center justify-center gap-3 px-4 py-2 text-sm ${variantClass[variant]}`}>
      <span>{text}</span>
      {link && (
        <Link
          href={link.href}
          className="font-semibold underline underline-offset-2">
          {link.label}
        </Link>
      )}
      {dismissible && (
        <button
          type="button"
          aria-label="Dismiss announcement"
          className="btn btn-circle btn-ghost btn-xs"
          onClick={() => {
            setHidden(true);
            onDismiss?.();
          }}>
          <FiX />
        </button>
      )}
    </div>
  );
};
