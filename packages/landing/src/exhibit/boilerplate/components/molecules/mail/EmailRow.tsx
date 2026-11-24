import type { FC } from 'react';

interface EmailRowProps {
  from: string;
  subject: string;
  preview: string;
  time: string;
  unread?: boolean;
  active?: boolean;
  onClick?: () => void;
}

export const EmailRow: FC<EmailRowProps> = ({
  from,
  subject,
  preview,
  time,
  unread = false,
  active = false,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid="email-row"
    aria-label={`Email from ${from}: ${subject}`}
    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
      active ? 'bg-primary/10' : 'hover:bg-base-200'
    }`}>
    <span
      data-testid="unread-dot"
      className={`h-2 w-2 shrink-0 rounded-full ${
        unread ? 'bg-primary' : 'bg-transparent'
      }`}
    />
    <span
      className={`w-36 shrink-0 truncate text-sm ${
        unread ? 'font-semibold' : 'text-base-content/70'
      }`}>
      {from}
    </span>
    <span className="min-w-0 flex-1 truncate">
      <span className={`text-sm ${unread ? 'font-semibold' : ''}`}>
        {subject}
      </span>
      <span className="text-base-content/50 text-sm"> — {preview}</span>
    </span>
    <span className="text-base-content/50 shrink-0 text-xs">{time}</span>
  </button>
);

EmailRow.displayName = 'EmailRow';
