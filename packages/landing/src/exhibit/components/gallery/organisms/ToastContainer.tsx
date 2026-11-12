'use client';

import { type FC } from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import { useToast } from '@/exhibit/providers/gallery/ToastProvider';

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  info: FiInfo,
};

const STYLES = {
  success: 'alert-success',
  error: 'alert-error',
  info: 'alert-info',
};

export const ToastContainer: FC = () => {
  const { toasts } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div
      data-testid="gallery-toasts"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 flex w-[340px] max-w-[90vw] -translate-x-1/2 flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            role="status"
            className={`alert ${STYLES[toast.type]} pointer-events-auto py-2 text-xs shadow-lg`}>
            <Icon className="size-4" />
            <span>{toast.message}</span>
          </div>
        );
      })}
    </div>
  );
};
