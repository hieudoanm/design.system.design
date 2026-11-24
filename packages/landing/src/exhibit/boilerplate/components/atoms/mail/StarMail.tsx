'use client';

import type { FC } from 'react';

interface StarMailProps {
  starred: boolean;
  onToggle?: (starred: boolean) => void;
  className?: string;
}

export const StarMail: FC<StarMailProps> = ({
  starred,
  onToggle,
  className = '',
}) => (
  <button
    type="button"
    data-testid="star-mail"
    aria-pressed={starred}
    aria-label={starred ? 'Unstar mail' : 'Star mail'}
    onClick={() => onToggle?.(!starred)}
    className={`btn btn-ghost btn-xs ${className}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={starred ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      data-testid="star-mail-icon"
      className={`h-4 w-4 ${starred ? 'fill-yellow-500 text-yellow-500' : 'text-base-content/40'}`}>
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  </button>
);
