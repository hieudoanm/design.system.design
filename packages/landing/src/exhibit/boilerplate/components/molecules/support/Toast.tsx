'use client';

import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  variant?: ToastVariant;
  duration?: number;
  onClose?: () => void;
}

const variantClass: Record<ToastVariant, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

export const Toast: FC<ToastProps> = ({
  message,
  variant = 'info',
  duration = 3000,
  onClose,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  return (
    <div className="toast toast-end">
      <div className={`alert ${variantClass[variant]}`}>
        <span>{message}</span>
        <button
          onClick={() => {
            setVisible(false);
            onClose?.();
          }}
          className="btn btn-ghost btn-xs">
          <FiX />
        </button>
      </div>
    </div>
  );
};
