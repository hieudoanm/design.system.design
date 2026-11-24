import type { FC } from 'react';

interface EmployeeAvatarProps {
  name: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClass: Record<NonNullable<EmployeeAvatarProps['size']>, string> = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
};

const initials = (name: string): string =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

export const EmployeeAvatar: FC<EmployeeAvatarProps> = ({
  name,
  src,
  size = 'md',
}) => (
  <div
    data-testid="employee-avatar"
    className={`avatar rounded-full ${sizeClass[size]} ${src ? '' : 'placeholder'}`}>
    {src ? (
      <img src={src} alt={name} className="rounded-full" />
    ) : (
      <div className="bg-base-200 text-base-content/70 flex w-full items-center justify-center rounded-full">
        <span>{initials(name)}</span>
      </div>
    )}
  </div>
);
