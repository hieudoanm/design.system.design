import type { FC } from 'react';

interface UsernameLabelProps {
  username: string;
  verified?: boolean;
  displayName?: string;
}

export const UsernameLabel: FC<UsernameLabelProps> = ({
  username,
  verified = false,
  displayName,
}) => (
  <span
    className="flex items-center gap-1 text-sm"
    data-testid="username-label">
    <span className="font-medium">{displayName ?? username}</span>
    {displayName && displayName !== username && (
      <span className="text-base-content/50">@{username}</span>
    )}
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
);
