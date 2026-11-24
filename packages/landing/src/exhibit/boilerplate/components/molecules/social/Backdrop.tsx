'use client';

import type { FC, MouseEvent, ReactNode } from 'react';

interface BackdropProps {
  open: boolean;
  onClose?: () => void;
  children?: ReactNode;
  className?: string;
  opaque?: boolean;
}

export const Backdrop: FC<BackdropProps> = ({
  open,
  onClose,
  children,
  className = '',
  opaque = false,
}) => {
  if (!open) return null;

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  return (
    <div
      aria-hidden={children ? undefined : true}
      onClick={handleClick}
      className={`${
        opaque ? 'bg-base-100' : 'bg-base-content/50'
      } fixed inset-0 z-40 flex items-center justify-center ${className}`}>
      {children}
    </div>
  );
};

Backdrop.displayName = 'Backdrop';
