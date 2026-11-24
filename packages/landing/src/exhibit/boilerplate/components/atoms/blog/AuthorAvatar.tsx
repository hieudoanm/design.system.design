import type { FC } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

interface AuthorAvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
}

const sizeClass: Record<AvatarSize, string> = {
  xs: 'w-6',
  sm: 'w-9',
  md: 'w-12',
  lg: 'w-16',
};

const initialsOf = (name: string): string => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const AuthorAvatar: FC<AuthorAvatarProps> = ({
  name,
  src,
  size = 'md',
}) => {
  if (src) {
    return (
      <div className={`avatar ${sizeClass[size]}`}>
        <img src={src} alt={name} className="rounded-full" />
      </div>
    );
  }
  return (
    <div className="avatar avatar-placeholder">
      <div
        className={`${sizeClass[size]} bg-primary text-primary-content flex aspect-square items-center justify-center rounded-full`}>
        <span className="font-semibold">{initialsOf(name)}</span>
      </div>
    </div>
  );
};
