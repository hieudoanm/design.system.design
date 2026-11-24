'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface LiveUpdateItem {
  id: string;
  time: string;
  content: string;
}

interface LiveUpdateProps {
  updates: LiveUpdateItem[];
  title?: string;
  live?: boolean;
  initialVisible?: number;
}

export const LiveUpdate: FC<LiveUpdateProps> = ({
  updates,
  title = 'Live',
  live = true,
  initialVisible = 3,
}) => {
  const [visible, setVisible] = useState(initialVisible);
  const shown = updates.slice(0, visible);
  const hasMore = updates.length > visible;

  return (
    <section
      className="card card-bordered border-base-300 bg-base-200"
      data-testid="live-update">
      <div className="card-body gap-3">
        <header className="flex items-center gap-2">
          {live && (
            <span className="badge badge-error badge-xs gap-1">
              <span
                className="h-1.5 w-1.5 animate-ping rounded-full bg-current"
                aria-hidden
              />
              LIVE
            </span>
          )}
          <h2 className="card-title text-base">{title}</h2>
        </header>
        {shown.length === 0 ? (
          <p className="text-base-content/50 text-sm">No updates yet.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {shown.map((update) => (
              <li key={update.id} className="flex gap-3">
                <time className="text-base-content/50 w-16 shrink-0 text-right font-mono text-xs">
                  {update.time}
                </time>
                <p className="min-w-0 flex-1 text-sm">{update.content}</p>
              </li>
            ))}
          </ul>
        )}
        {hasMore && (
          <button
            type="button"
            className="btn btn-ghost btn-sm self-start"
            onClick={() => setVisible((current) => current + initialVisible)}>
            Show more
          </button>
        )}
      </div>
    </section>
  );
};
