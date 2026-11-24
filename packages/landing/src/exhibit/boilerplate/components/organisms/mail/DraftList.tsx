import type { FC } from 'react';

interface Draft {
  id: string;
  to: string;
  subject: string;
  preview: string;
  updated: string;
}

interface DraftListProps {
  drafts: Draft[];
  onEdit?: (draft: Draft) => void;
  onDelete?: (draft: Draft) => void;
}

export const DraftList: FC<DraftListProps> = ({ drafts, onEdit, onDelete }) => (
  <div
    className="border-base-content/10 bg-base-200 w-full overflow-hidden rounded-xl border"
    data-testid="draft-list">
    <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-medium">Drafts</h3>
      <span className="badge badge-ghost badge-sm">{drafts.length}</span>
    </header>
    <ul className="flex flex-col">
      {drafts.map((draft) => (
        <li
          key={draft.id}
          className="hover:bg-base-300/60 flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => onEdit?.(draft)}
            className="min-w-0 flex-1 text-left">
            <p className="truncate text-sm font-medium">{draft.subject}</p>
            <p className="text-base-content/50 truncate text-xs">
              To {draft.to} · {draft.preview}
            </p>
            <p className="text-base-content/40 text-xs">{draft.updated}</p>
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(draft)}
            className="btn btn-ghost btn-xs text-error">
            Delete
          </button>
        </li>
      ))}
      {drafts.length === 0 && (
        <li className="text-base-content/40 p-4 text-center text-sm">
          No drafts
        </li>
      )}
    </ul>
  </div>
);

DraftList.displayName = 'DraftList';
