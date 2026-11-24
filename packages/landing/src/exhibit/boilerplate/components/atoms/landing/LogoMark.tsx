import type { FC } from 'react';

interface LogoMarkProps {
  name: string;
  size?: number;
}

export const LogoMark: FC<LogoMarkProps> = ({ name, size = 32 }) => (
  <svg
    data-testid="logo-mark"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    role="img"
    aria-label={`${name} logo`}>
    <circle cx="12" cy="12" r="11" className="fill-primary" />
    <path
      d="M7 8.5h10M7 12h6M7 15.5h8"
      className="stroke-base-100"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
