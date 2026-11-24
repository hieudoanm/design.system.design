import type { FC, ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  description?: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  className?: string;
  children?: ReactNode;
}

const variantClass: Record<AlertVariant, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
};

export const Alert: FC<AlertProps> = ({
  variant = 'info',
  title,
  description,
  dismissible = false,
  onClose,
  className = '',
  children,
}) => (
  <div role="alert" className={`alert ${variantClass[variant]} ${className}`}>
    <div className="flex flex-1 items-start gap-2">
      <div className="flex flex-col gap-0.5">
        {title && <span className="font-medium">{title}</span>}
        {description && <div className="text-sm">{description}</div>}
        {children}
      </div>
    </div>
    {dismissible && (
      <button
        aria-label="Dismiss alert"
        onClick={onClose}
        className="btn btn-ghost btn-xs">
        <FiX />
      </button>
    )}
  </div>
);
