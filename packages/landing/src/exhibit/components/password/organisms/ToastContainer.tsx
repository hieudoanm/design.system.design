'use client';

import { type FC } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';
import { useToast } from '@/exhibit/providers/password/ToastProvider';

export const ToastContainer: FC = () => {
  const { toasts, removeToast } = useToast();
  const icons = {
    success: <FiCheckCircle className="text-success size-5" />,
    error: <FiAlertCircle className="text-error size-5" />,
    info: <FiInfo className="text-info size-5" />,
  };
  return (
    <div className="fixed right-4 bottom-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-base-100 alert flex items-center gap-2 shadow-lg">
          {icons[t.type]}
          <span className="flex-1 text-sm">{t.message}</span>
          <button
            type="button"
            onClick={() => removeToast(t.id)}
            className="btn btn-ghost btn-xs btn-circle">
            <FiX className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
