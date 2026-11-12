import { type FC } from 'react';

type BadgeVariant = 'primary' | 'secondary' | 'neutral' | 'ghost' | 'error';

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  primary: 'badge-primary',
  secondary: 'badge-secondary',
  neutral: 'badge-neutral',
  ghost: 'badge-ghost',
  error: 'badge-error',
};

interface BadgeProps {
  count: number;
  muted?: boolean;
  variant?: BadgeVariant;
}

export const Badge: FC<BadgeProps> = ({
  count,
  muted = false,
  variant = 'primary',
}) => {
  if (count <= 0) return null;
  const display = count > 99 ? '99+' : `${count}`;
  return (
    <span
      className={`badge badge-sm min-w-5 px-1.5 ${VARIANT_CLASSES[muted ? 'neutral' : variant]}`}
      aria-label={`${count} unread messages`}>
      {display}
    </span>
  );
};
