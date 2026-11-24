import type { FC } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';
type AvatarColor = 'neutral' | 'primary' | 'secondary' | 'accent';

interface TeamAvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  color?: AvatarColor;
  ring?: boolean;
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

export const TeamAvatar: FC<TeamAvatarProps> = ({
  name,
  src,
  size = 'md',
  color = 'neutral',
  ring = false,
}) => {
  const ringClass = ring ? 'ring ring-base-content/20 ring-offset-2' : '';
  if (src) {
    return (
      <div className={`avatar ${ringClass}`}>
        <img
          src={src}
          alt={name}
          className={`${sizeClass[size]} rounded-full`}
        />
      </div>
    );
  }
  return (
    <div className="avatar avatar-placeholder">
      <div
        className={`${sizeClass[size]} ${colorClass[color]} flex aspect-square items-center justify-center rounded-full font-semibold ${ringClass}`}>
        {initialsOf(name)}
      </div>
    </div>
  );
};
