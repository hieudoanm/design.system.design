import type { FC } from 'react';

interface SentItemProps {
  to: string;
  subject: string;
  preview: string;
  time: string;
  status?: 'delivered' | 'failed';
  onClick?: () => void;
}

export const SentItem: FC<SentItemProps> = ({
  to,
  subject,
  preview,
  time,
  status = 'delivered',
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid="sent-item"
    className="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-3 text-left">
    <span
      data-testid="status-dot"
      className={`h-2 w-2 shrink-0 rounded-full ${
        status === 'failed' ? 'bg-error' : 'bg-success'
      }`}
    />
    <span className="w-36 shrink-0 truncate text-sm">{to}</span>
    <span className="min-w-0 flex-1 truncate">
      <span className="text-sm">{subject}</span>
      <span className="text-base-content/50 text-sm"> — {preview}</span>
    </span>
    <span className="text-base-content/50 shrink-0 text-xs">{time}</span>
  </button>
);

SentItem.displayName = 'SentItem';
