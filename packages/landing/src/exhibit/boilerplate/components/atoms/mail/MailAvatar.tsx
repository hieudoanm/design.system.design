import type { FC } from 'react';

interface MailAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
} as const;

const getInitials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const MailAvatar: FC<MailAvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
}) => (
  <div data-testid="mail-avatar" className={`avatar ${className}`}>
    <div
      className={`bg-neutral text-neutral-content rounded-full ${sizeClasses[size]}`}>
      {src ? (
        <img
          src={src}
          alt={`${name} avatar`}
          className="rounded-full object-cover"
        />
      ) : (
        <span className="flex h-full w-full items-center justify-center rounded-full">
          {getInitials(name)}
        </span>
      )}
    </div>
  </div>
);
