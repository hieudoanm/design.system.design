import type { FC } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
type AvatarColor = 'neutral' | 'primary' | 'secondary' | 'accent';

interface ContactInitialsProps {
  name: string;
  size?: AvatarSize;
  color?: AvatarColor;
}

const sizeClass: Record<AvatarSize, string> = {
  xs: 'w-6 text-xs',
  sm: 'w-9 text-sm',
  md: 'w-12 text-base',
  lg: 'w-16 text-xl',
};

const colorClass: Record<AvatarColor, string> = {
  neutral: 'bg-neutral text-neutral-content',
  primary: 'bg-primary text-primary-content',
  secondary: 'bg-secondary text-secondary-content',
  accent: 'bg-accent text-accent-content',
};

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const ContactInitials: FC<ContactInitialsProps> = ({
  name,
  size = 'md',
  color = 'primary',
}) => (
  <span
    data-testid="contact-initials"
    role="img"
    aria-label={name}
    className={`${sizeClass[size]} ${colorClass[color]} inline-flex items-center justify-center rounded-full font-semibold`}>
    {initialsOf(name)}
  </span>
);
