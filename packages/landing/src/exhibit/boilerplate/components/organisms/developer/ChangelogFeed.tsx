import type { FC } from 'react';

interface ChangelogEntry {
  id: string;
  version: string;
  date?: string;
  changes: string[];
}

interface ChangelogFeedProps {
  entries: ChangelogEntry[];
  title?: string;
}

export const ChangelogFeed: FC<ChangelogFeedProps> = ({
  entries,
  title = 'Changelog',
}) => (
  <section className="py-4">
    <h2 className="mb-4 text-xl">{title}</h2>
    <ol className="flex flex-col gap-4">
      {entries.length === 0 && (
        <li className="text-base-content/50 text-sm">No changes released.</li>
      )}
      {entries.map((entry) => (
        <li
          key={entry.id}
          className="card bg-base-200 border-base-content/10 rounded-xl border">
          <div className="card-body">
            <header className="flex items-center justify-between">
              <h3 className="font-mono text-sm font-medium">{entry.version}</h3>
              {entry.date && (
                <time className="text-base-content/40 text-xs">
                  {entry.date}
                </time>
              )}
            </header>
            <ul className="text-base-content/70 mt-2 flex list-disc flex-col gap-1 pl-5 text-sm">
              {entry.changes.map((change, index) => (
                <li key={index}>{change}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  </section>
);
