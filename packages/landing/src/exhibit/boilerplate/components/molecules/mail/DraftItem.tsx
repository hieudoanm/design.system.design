import type { FC } from 'react';

interface DraftItemProps {
  to: string;
  subject: string;
  preview: string;
  updatedAt: string;
  onClick?: () => void;
}

export const DraftItem: FC<DraftItemProps> = ({
  to,
  subject,
  preview,
  updatedAt,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    data-testid="draft-item"
    className="hover:bg-base-200 flex w-full items-center gap-3 px-4 py-3 text-left">
    <span className="text-base-content/60">📝</span>
    <span className="w-36 shrink-0 truncate text-sm font-medium">{to}</span>
    <span className="min-w-0 flex-1 truncate">
      <span className="text-sm">{subject}</span>
      <span className="text-base-content/50 text-sm"> — {preview}</span>
    </span>
    <span className="text-base-content/50 shrink-0 text-xs">{updatedAt}</span>
  </button>
);

DraftItem.displayName = 'DraftItem';
