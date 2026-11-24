import type { FC } from 'react';

type IconSize = 'sm' | 'md' | 'lg';

interface AccountIconProps {
  name: string;
  size?: IconSize;
}

const sizeClass: Record<IconSize, string> = {
  sm: 'w-8',
  md: 'w-10',
  lg: 'w-12',
};

export const AccountIcon: FC<AccountIconProps> = ({ name, size = 'md' }) => (
  <div
    aria-label={name}
    className={`avatar avatar-placeholder ${sizeClass[size]}`}>
    <div className="bg-base-200 text-base-content flex aspect-square items-center justify-center rounded-lg">
      <svg
        data-testid="account-icon"
        width="60%"
        height="60%"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true">
        <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 10h.01M15 10h.01" />
      </svg>
    </div>
  </div>
);
