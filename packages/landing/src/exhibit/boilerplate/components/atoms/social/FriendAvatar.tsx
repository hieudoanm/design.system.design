import type { FC } from 'react';

interface FriendAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass = {
  sm: 'w-6 text-xs',
  md: 'w-10 text-base',
  lg: 'w-16 text-2xl',
} as const;

const initials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const FriendAvatar: FC<FriendAvatarProps> = ({
  name,
  src,
  size = 'md',
}) => (
  <div className={`avatar ${sizeClass[size]}`} data-testid="friend-avatar">
    <div className="bg-base-content/15 rounded-full">
      {src ? (
        <img src={src} alt={name} className="object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center font-medium">
          {initials(name)}
        </span>
      )}
    </div>
  </div>
);
