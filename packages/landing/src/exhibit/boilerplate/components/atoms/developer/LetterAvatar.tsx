import type { FC } from 'react';

type LetterAvatarColor = 'neutral' | 'primary' | 'secondary' | 'accent';
type LetterAvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface LetterAvatarProps {
  name: string;
  color?: LetterAvatarColor;
  size?: LetterAvatarSize;
  className?: string;
}

const sizeClass: Record<LetterAvatarSize, string> = {
  xs: 'w-6 text-xs',
  sm: 'w-9 text-sm',
  md: 'w-12 text-base',
  lg: 'w-16 text-2xl',
};

const colorClass: Record<LetterAvatarColor, string> = {
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

export const LetterAvatar: FC<LetterAvatarProps> = ({
  name,
  color = 'primary',
  size = 'md',
  className = '',
}) => (
  <div
    role="img"
    aria-label={name}
    className={`avatar avatar-placeholder ${colorClass[color]} ${className}`}>
    <div
      className={`${sizeClass[size]} flex aspect-square items-center justify-center rounded-full`}>
      <span className="font-semibold">{initialsOf(name)}</span>
    </div>
  </div>
);
