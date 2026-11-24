import type { FC, ReactNode } from 'react';
import {
  FiInfo,
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

type BannerVariant = 'info' | 'success' | 'warning' | 'error';

interface BannerProps {
  title?: string;
  description?: ReactNode;
  variant?: BannerVariant;
  icon?: ReactNode;
  action?: ReactNode;
  dismissible?: boolean;
  onClose?: () => void;
  className?: string;
  children?: ReactNode;
}

const iconClass: Record<BannerVariant, ReactNode> = {
  info: <FiInfo aria-hidden="true" />,
  success: <FiCheckCircle aria-hidden="true" />,
  warning: <FiAlertTriangle aria-hidden="true" />,
  error: <FiXCircle aria-hidden="true" />,
};

const accentClass: Record<BannerVariant, string> = {
  info: 'border-l-info text-info',
  success: 'border-l-success text-success',
  warning: 'border-l-warning text-warning',
  error: 'border-l-error text-error',
};

export const Banner: FC<BannerProps> = ({
  title,
  description,
  variant = 'info',
  icon,
  action,
  dismissible = false,
  onClose,
  className = '',
  children,
}) => (
  <div
    role="status"
    className={`border-base-content/10 bg-base-100 flex items-start gap-3 border border-l-4 p-4 ${accentClass[variant]} ${className}`}>
    <span className="mt-0.5 shrink-0">{icon ?? iconClass[variant]}</span>
    <div className="flex flex-1 flex-col gap-0.5">
      {title && <span className="text-base-content font-medium">{title}</span>}
      {description && (
        <div className="text-base-content/70 text-sm">{description}</div>
      )}
      {children}
    </div>
    {action && <div className="shrink-0">{action}</div>}
    {dismissible && (
      <button
        type="button"
        aria-label="Dismiss banner"
        className="btn btn-ghost btn-xs shrink-0"
        onClick={onClose}>
        <FiXCircle aria-hidden="true" />
      </button>
    )}
  </div>
);
