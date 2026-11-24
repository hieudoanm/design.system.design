import { FiX } from 'react-icons/fi';
import type { FC } from 'react';

type TagVariant =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface TagProps {
  label: string;
  variant?: TagVariant;
  onRemove?: () => void;
}

const variantClass: Record<TagVariant, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

export const Tag: FC<TagProps> = ({ label, variant = 'neutral', onRemove }) => (
  <span className={`badge badge-lg gap-1 ${variantClass[variant]}`}>
    {label}
    {onRemove && (
      <button
        aria-label={`Remove ${label} tag`}
        onClick={onRemove}
        className="btn btn-ghost btn-xs btn-circle ml-0.5">
        <FiX />
      </button>
    )}
  </span>
);
