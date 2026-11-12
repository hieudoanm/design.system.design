import { type FC } from 'react';

interface IconButtonProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export const IconButton: FC<IconButtonProps> = ({
  label,
  onClick,
  children,
  className = '',
  disabled = false,
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-ghost btn-xs ${className}`.trim()}>
    {children}
  </button>
);
