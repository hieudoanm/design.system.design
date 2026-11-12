import { type ButtonHTMLAttributes, type FC } from 'react';
import type { IconType } from 'react-icons';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconType;
  label: string;
  active?: boolean;
}

export const IconButton: FC<IconButtonProps> = ({
  icon: Icon,
  label,
  active = false,
  className = '',
  ...rest
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`btn btn-ghost btn-sm btn-circle ${active ? 'btn-active' : ''} ${className}`}
    {...rest}>
    <Icon aria-hidden="true" className="h-5 w-5" />
  </button>
);
