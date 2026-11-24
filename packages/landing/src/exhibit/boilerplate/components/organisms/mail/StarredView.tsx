import type { FC } from 'react';

interface StarredEmail {
  id: string;
  from: string;
  subject: string;
  time: string;
}

interface StarredViewProps {
  emails: StarredEmail[];
  onUnstar?: (email: StarredEmail) => void;
}

export const StarredView: FC<StarredViewProps> = ({ emails, onUnstar }) => (
  <div
    className="border-base-content/10 bg-base-200 w-full overflow-hidden rounded-xl border"
    data-testid="starred-view">
    <header className="border-base-content/10 flex items-center justify-between border-b px-4 py-3">
      <h3 className="text-sm font-medium">Starred</h3>
      <span className="badge badge-warning badge-sm">{emails.length}</span>
    </header>
    <ul className="flex flex-col">
      {emails.map((email) => (
        <li
          key={email.id}
          className="hover:bg-base-300/60 flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            aria-label={`Unstar ${email.subject}`}
            onClick={() => onUnstar?.(email)}
            className="text-warning text-lg">
            ★
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{email.subject}</p>
            <p className="text-base-content/50 text-xs">
              {email.from} · {email.time}
            </p>
          </div>
        </li>
      ))}
      {emails.length === 0 && (
        <li className="text-base-content/40 p-4 text-center text-sm">
          No starred emails
        </li>
      )}
    </ul>
  </div>
);

StarredView.displayName = 'StarredView';
