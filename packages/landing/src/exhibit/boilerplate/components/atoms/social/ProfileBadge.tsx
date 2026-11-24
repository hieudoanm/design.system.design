import type { FC } from 'react';

interface ProfileBadgeProps {
  name: string;
  src?: string;
  verified?: boolean;
  role?: string;
}

export const ProfileBadge: FC<ProfileBadgeProps> = ({
  name,
  src,
  verified = false,
  role,
}) => (
  <div className="flex items-center gap-2" data-testid="profile-badge">
    <div className="avatar">
      <div className="bg-base-content/15 w-8 rounded-full">
        {src ? <img src={src} alt={name} /> : <span>{name.charAt(0)}</span>}
      </div>
    </div>
    <div className="flex flex-col">
      <span className="flex items-center gap-1 text-sm font-medium">
        {name}
        {verified && (
          <svg
            aria-label="Verified"
            className="text-primary h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
          </svg>
        )}
      </span>
      {role && <span className="text-base-content/50 text-xs">{role}</span>}
    </div>
  </div>
);
