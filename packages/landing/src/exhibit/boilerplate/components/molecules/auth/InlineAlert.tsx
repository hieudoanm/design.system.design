import { FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import type { FC, ReactNode } from 'react';

interface InlineAlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error';
  children: ReactNode;
  onClose?: () => void;
}

const DEFAULT_ICON: Record<
  NonNullable<InlineAlertProps['variant']>,
  ReactNode
> = {
  info: <FiInfo />,
  success: <FiCheckCircle />,
  warning: <FiAlertCircle />,
  error: <FiAlertCircle />,
};

const ACCENT: Record<NonNullable<InlineAlertProps['variant']>, string> = {
  info: 'border-info text-info',
  success: 'border-success text-success',
  warning: 'border-warning text-warning',
  error: 'border-error text-error',
};

export const InlineAlert: FC<InlineAlertProps> = ({
  variant = 'info',
  children,
  onClose,
}) => (
  <div
    role="status"
    className={`border-base-content/10 bg-base-200 flex w-full items-start gap-2 rounded-lg border-l-4 px-3 py-2 ${ACCENT[variant]}`}>
    <span className="mt-0.5 shrink-0">{DEFAULT_ICON[variant]}</span>
    <p className="text-sm">{children}</p>
    {onClose && (
      <button
        type="button"
        aria-label="Dismiss alert"
        className="btn btn-ghost btn-xs ml-auto shrink-0"
        onClick={onClose}>
        <FiX />
      </button>
    )}
  </div>
);
