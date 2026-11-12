import { type FC } from 'react';
import { FiActivity } from 'react-icons/fi';
import { formatRelativeTime } from '@/exhibit/utils/password/format';
import type { AccessEntry } from '@/exhibit/types/password';

const actionLabel: Record<AccessEntry['action'], string> = {
  view: 'Viewed',
  copy: 'Copied',
  edit: 'Edited',
  create: 'Created',
  share: 'Shared with',
};

export const AccessLogCard: FC<{ entries: AccessEntry[] }> = ({ entries }) => (
  <div className="card bg-base-200 card-body p-4">
    <h3 className="flex items-center gap-2 text-sm font-semibold">
      <FiActivity className="size-4" /> Access Log
    </h3>
    {entries.length === 0 && (
      <p className="text-base-content/50 text-xs">No activity recorded yet</p>
    )}
    <ul className="space-y-1">
      {entries.map((entry, idx) => (
        <li
          key={`${entry.timestamp}-${idx}`}
          className="text-base-content/70 flex items-center justify-between gap-2 text-xs">
          <span>
            {actionLabel[entry.action]}
            {entry.detail ? ` ${entry.detail}` : ''}
          </span>
          <span className="text-base-content/40 shrink-0">
            {formatRelativeTime(entry.timestamp)}
          </span>
        </li>
      ))}
    </ul>
  </div>
);
