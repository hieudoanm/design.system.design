import type { FC, ReactNode } from 'react';
import { FiX } from 'react-icons/fi';

type ChipColor =
  | 'neutral'
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'success'
  | 'warning'
  | 'error'
  | 'info';

interface ChipProps {
  label: string;
  color?: ChipColor;
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md';
  icon?: ReactNode;
  avatar?: ReactNode;
  onClick?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  className?: string;
}

const colorClass: Record<ChipColor, string> = {
  neutral: 'badge-neutral',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  accent: 'badge-accent',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  info: 'badge-info',
};

const sizeClass: Record<NonNullable<ChipProps['size']>, string> = {
  sm: 'badge-sm',
  md: 'badge-md',
};

const baseClass = ({
  color,
  variant,
  size,
  interactive,
  className,
}: Pick<ChipProps, 'color' | 'variant' | 'size' | 'className'> & {
  interactive: boolean;
}): string => {
  return `${colorClass[color ?? 'neutral']} ${sizeClass[size ?? 'md']} ${
    variant === 'outline' ? 'badge-outline' : ''
  } ${interactive ? 'cursor-pointer' : ''} ${className ?? ''}`.trim();
};

export const Chip: FC<ChipProps> = ({
  label,
  color = 'neutral',
  variant = 'filled',
  size = 'md',
  icon,
  avatar,
  onClick,
  onDelete,
  disabled = false,
  className = '',
}) => {
  const interactive = Boolean(onClick) || Boolean(onDelete);

  const content = (
    <>
      {avatar && <span className="avatar">{avatar}</span>}
      {icon}
      {label}
      {onDelete && (
        <button
          type="button"
          aria-label={`Remove ${label}`}
          disabled={disabled}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="ml-1">
          <FiX aria-hidden="true" />
        </button>
      )}
    </>
  );

  if (interactive && !disabled) {
    return (
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className={`badge gap-1 ${baseClass({ color, variant, size, interactive, className })}`}>
        {content}
      </button>
    );
  }

  return (
    <span
      className={`badge gap-1 ${baseClass({ color, variant, size, interactive, className })}`}>
      {content}
    </span>
  );
};
