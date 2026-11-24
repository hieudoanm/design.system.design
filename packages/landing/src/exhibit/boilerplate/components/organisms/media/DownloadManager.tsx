'use client';

import { useState } from 'react';
import type { FC } from 'react';

type DownloadStatus = 'downloading' | 'paused' | 'complete' | 'error';

interface DownloadItem {
  id: string;
  title: string;
  size: string;
  progress: number;
  status: DownloadStatus;
}

interface DownloadManagerProps {
  downloads: DownloadItem[];
  onPause?: (id: string, paused: boolean) => void;
  onCancel?: (id: string) => void;
}

const statusBadgeClass = (status: DownloadStatus): string => {
  if (status === 'complete') {
    return 'badge-success';
  }
  if (status === 'error') {
    return 'badge-error';
  }
  if (status === 'paused') {
    return 'badge-warning';
  }
  return 'badge-info';
};

export const DownloadManager: FC<DownloadManagerProps> = ({
  downloads,
  onPause,
  onCancel,
}) => {
  const [statuses, setStatuses] = useState<Record<string, DownloadStatus>>(() =>
    Object.fromEntries(downloads.map((item) => [item.id, item.status]))
  );

  const togglePause = (item: DownloadItem): void => {
    const current = statuses[item.id] ?? item.status;
    const next = current === 'paused' ? 'downloading' : 'paused';
    setStatuses((prev) => ({ ...prev, [item.id]: next }));
    onPause?.(item.id, next === 'paused');
  };

  if (downloads.length === 0) {
    return (
      <section data-testid="download-manager" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">No active downloads</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="download-manager" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Downloads</h2>
      <ul className="flex flex-col gap-2">
        {downloads.map((item) => {
          const status = statuses[item.id] ?? item.status;
          const badge = `badge ${statusBadgeClass(status)} badge-sm`;
          return (
            <li key={item.id} className="card bg-base-200">
              <div className="card-body gap-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="text-sm font-medium">{item.title}</h3>
                    <p className="text-base-content/50 text-xs">{item.size}</p>
                  </div>
                  <span className={badge} data-testid={`status-${item.id}`}>
                    {status}
                  </span>
                </div>
                <progress
                  className="progress progress-primary w-full"
                  value={status === 'complete' ? 100 : item.progress}
                  max={100}
                />
                <div className="flex items-center justify-between">
                  <span className="text-base-content/50 text-xs">
                    {item.progress}%
                  </span>
                  <div className="flex gap-1">
                    {status === 'downloading' || status === 'paused' ? (
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs"
                        aria-label={`${status === 'paused' ? 'Resume' : 'Pause'} ${item.title}`}
                        onClick={() => togglePause(item)}>
                        {status === 'paused' ? 'Resume' : 'Pause'}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      aria-label={`Cancel ${item.title}`}
                      onClick={() => onCancel?.(item.id)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
};
