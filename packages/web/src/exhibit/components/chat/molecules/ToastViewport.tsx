'use client';

import { type FC } from 'react';
import {
  FaCheckCircle,
  FaExclamationCircle,
  FaInfoCircle,
} from 'react-icons/fa';
import { useToast, type ToastKind } from '@/exhibit/providers/chat/ToastProvider';

const KIND_ICONS: Record<ToastKind, FC<{ className?: string }>> = {
  success: FaCheckCircle,
  error: FaExclamationCircle,
  info: FaInfoCircle,
};

const KIND_CLASSES: Record<ToastKind, string> = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

export const ToastViewport: FC = () => {
  const { toasts, dismissToast } = useToast();
  if (toasts.length === 0) return null;

  return (
    <div className="toast toast-end z-50">
      {toasts.map((toast) => {
        const Icon = KIND_ICONS[toast.kind];
        return (
          <div
            key={toast.id}
            role="status"
            className={`alert ${KIND_CLASSES[toast.kind]} shadow-lg`}>
            <Icon aria-hidden="true" className="h-5 w-5" />
            <span>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label="Dismiss toast"
              className="btn btn-ghost btn-xs btn-circle">
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
};
