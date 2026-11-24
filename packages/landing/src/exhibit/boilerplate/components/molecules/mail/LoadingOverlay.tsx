'use client';

import type { FC } from 'react';
import { Loading } from '../../atoms/support/Loading';

interface LoadingOverlayProps {
  open: boolean;
  label?: string;
  variant?: 'spinner' | 'dots' | 'ring' | 'ball' | 'bars' | 'infinity';
  transparent?: boolean;
  onClose?: () => void;
}

export const LoadingOverlay: FC<LoadingOverlayProps> = ({
  open,
  label,
  variant = 'spinner',
  transparent = false,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div
      role="status"
      onClick={onClose}
      className={`${
        transparent ? 'bg-base-content/20' : 'bg-base-content/60'
      } fixed inset-0 z-50 flex cursor-pointer flex-col items-center justify-center gap-3 backdrop-blur-sm`}>
      <Loading variant={variant} size="lg" />
      {label && <p className="text-base-100 text-sm font-medium">{label}</p>}
    </div>
  );
};

LoadingOverlay.displayName = 'LoadingOverlay';
