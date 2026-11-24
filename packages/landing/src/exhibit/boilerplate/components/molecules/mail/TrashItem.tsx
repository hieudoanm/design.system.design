import type { FC } from 'react';

interface TrashItemProps {
  from: string;
  subject: string;
  preview: string;
  time: string;
  onRestore?: () => void;
  onDeleteForever?: () => void;
}

export const TrashItem: FC<TrashItemProps> = ({
  from,
  subject,
  preview,
  time,
  onRestore,
  onDeleteForever,
}) => (
  <div
    data-testid="trash-item"
    className="border-base-content/10 flex items-center gap-3 border-b px-4 py-3">
    <span className="text-base-content/40">🗑️</span>
    <div className="min-w-0 flex-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate text-sm font-medium">{from}</span>
        <span className="text-base-content/50 shrink-0 text-xs">{time}</span>
      </div>
      <p className="truncate text-sm">{subject}</p>
      <p className="text-base-content/50 truncate text-sm">{preview}</p>
    </div>
    <div className="flex shrink-0 flex-col gap-1">
      <button
        type="button"
        className="btn btn-ghost btn-xs"
        onClick={onRestore}>
        Restore
      </button>
      <button
        type="button"
        className="btn btn-ghost btn-xs text-error"
        onClick={onDeleteForever}>
        Delete
      </button>
    </div>
  </div>
);

TrashItem.displayName = 'TrashItem';
