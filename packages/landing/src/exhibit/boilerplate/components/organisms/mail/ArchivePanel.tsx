import type { FC } from 'react';

interface ArchivedEmail {
  id: string;
  from: string;
  subject: string;
  archivedAt: string;
}

interface ArchivePanelProps {
  emails: ArchivedEmail[];
  onRestore?: (email: ArchivedEmail) => void;
  onDelete?: (email: ArchivedEmail) => void;
}

export const ArchivePanel: FC<ArchivePanelProps> = ({
  emails,
  onRestore,
  onDelete,
}) => (
  <div
    className="border-base-content/10 bg-base-200 w-full overflow-hidden rounded-xl border"
    data-testid="archive-panel">
    <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-medium">Archive</h3>
      <span className="badge badge-ghost badge-sm">{emails.length}</span>
    </header>
    <ul className="flex flex-col">
      {emails.map((email) => (
        <li
          key={email.id}
          className="hover:bg-base-300/60 flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{email.subject}</p>
            <p className="text-base-content/50 text-xs">
              {email.from} · Archived {email.archivedAt}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onRestore?.(email)}
            className="btn btn-ghost btn-xs">
            Restore
          </button>
          <button
            type="button"
            onClick={() => onDelete?.(email)}
            className="btn btn-ghost btn-xs text-error">
            Delete
          </button>
        </li>
      ))}
      {emails.length === 0 && (
        <li className="text-base-content/40 p-4 text-center text-sm">
          Archive is empty
        </li>
      )}
    </ul>
  </div>
);

ArchivePanel.displayName = 'ArchivePanel';
