import type { FC } from 'react';

interface SpamItemProps {
  from: string;
  subject: string;
  preview: string;
  time: string;
  flagged?: boolean;
  onReport?: () => void;
  onMoveToInbox?: () => void;
}

export const SpamItem: FC<SpamItemProps> = ({
  from,
  subject,
  preview,
  time,
  flagged = false,
  onReport,
  onMoveToInbox,
}) => (
  <div
    data-testid="spam-item"
    className="border-base-content/10 flex items-center gap-3 border-b px-4 py-3">
    <span className="text-warning">⚠️</span>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium">{from}</span>
        <span className="text-base-content/50 shrink-0 text-xs">{time}</span>
      </div>
      <p className="truncate text-sm">{subject}</p>
      <p className="text-base-content/50 truncate text-sm">{preview}</p>
      {flagged && (
        <span className="badge badge-warning badge-sm mt-1">Flagged</span>
      )}
    </div>
    <div className="flex shrink-0 flex-col gap-1">
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={onMoveToInbox}>
        Move to inbox
      </button>
      <button type="button" className="btn btn-ghost btn-xs" onClick={onReport}>
        Report
      </button>
    </div>
  </div>
);

SpamItem.displayName = 'SpamItem';
