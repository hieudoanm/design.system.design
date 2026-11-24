import type { FC } from 'react';

interface MessageIconProps {
  unread?: boolean;
  label?: string;
  onClick?: () => void;
}

export const MessageIcon: FC<MessageIconProps> = ({
  unread = false,
  label = 'Message',
  onClick,
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    className="btn btn-ghost btn-circle btn-sm relative"
    data-testid="message-icon">
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
    {unread && (
      <span
        aria-hidden
        className="badge badge-error absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full p-0"
      />
    )}
  </button>
);
