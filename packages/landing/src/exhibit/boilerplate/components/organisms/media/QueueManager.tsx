'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface QueueItem {
  id: string;
  title: string;
  artist?: string;
}

interface QueueManagerProps {
  items: QueueItem[];
  onRemove?: (id: string) => void;
  onMove?: (id: string, direction: 'up' | 'down') => void;
  onClear?: () => void;
}

export const QueueManager: FC<QueueManagerProps> = ({
  items,
  onRemove,
  onMove,
  onClear,
}) => {
  const [queue, setQueue] = useState<QueueItem[]>(items);

  const remove = (id: string): void => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
    onRemove?.(id);
  };

  const move = (id: string, direction: 'up' | 'down'): void => {
    const index = queue.findIndex((item) => item.id === id);
    const target = direction === 'up' ? index - 1 : index + 1;
    if (index < 0 || target < 0 || target >= queue.length) {
      return;
    }
    const next = [...queue];
    const item = next[index];
    next[index] = next[target];
    next[target] = item;
    setQueue(next);
    onMove?.(id, direction);
  };

  const clear = (): void => {
    setQueue([]);
    onClear?.();
  };

  if (queue.length === 0) {
    return (
      <section data-testid="queue-manager" className="card bg-base-200">
        <div className="card-body items-center text-center">
          <p className="text-base-content/60">Queue is empty</p>
        </div>
      </section>
    );
  }

  return (
    <section data-testid="queue-manager" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Up next ({queue.length})</h2>
        <button type="button" className="btn btn-ghost btn-sm" onClick={clear}>
          Clear
        </button>
      </div>
      <ol className="divide-base-content/10 bg-base-200 flex flex-col divide-y rounded-xl px-2">
        {queue.map((item, index) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-3 py-2">
            <div className="flex items-center gap-3">
              <span className="text-base-content/40 w-6 text-center text-sm">
                {index + 1}
              </span>
              <div>
                <h3 className="text-sm font-medium">{item.title}</h3>
                {item.artist ? (
                  <p className="text-base-content/50 text-xs">{item.artist}</p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label={`Move ${item.title} up`}
                onClick={() => move(item.id, 'up')}>
                &#9650;
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label={`Move ${item.title} down`}
                onClick={() => move(item.id, 'down')}>
                &#9660;
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                aria-label={`Remove ${item.title}`}
                onClick={() => remove(item.id)}>
                &#10005;
              </button>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
};
