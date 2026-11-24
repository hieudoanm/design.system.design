import type { FC } from 'react';

interface SpamEmail {
  id: string;
  from: string;
  subject: string;
  reason: string;
}

interface SpamFolderProps {
  emails: SpamEmail[];
  onNotSpam?: (email: SpamEmail) => void;
  onDelete?: (email: SpamEmail) => void;
}

export const SpamFolder: FC<SpamFolderProps> = ({
  emails,
  onNotSpam,
  onDelete,
}) => (
  <div
    className="border-base-content/10 bg-base-200 w-full overflow-hidden rounded-xl border"
    data-testid="spam-folder">
    <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-medium">Spam</h3>
      <span className="badge badge-error badge-sm">{emails.length}</span>
    </header>
    <ul className="flex flex-col">
      {emails.map((email) => (
        <li
          key={email.id}
          className="hover:bg-base-300/60 flex items-center gap-3 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{email.subject}</p>
            <p className="text-base-content/50 text-xs">
              {email.from} · {email.reason}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNotSpam?.(email)}
            className="btn btn-ghost btn-xs">
            Not spam
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
          Spam folder is empty
        </li>
      )}
    </ul>
  </div>
);

SpamFolder.displayName = 'SpamFolder';
