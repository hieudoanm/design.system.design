import type { FC } from 'react';

interface Recognition {
  id: string;
  from: string;
  to: string;
  message: string;
  time: string;
  badge?: string;
}

interface RecognitionFeedProps {
  items: Recognition[];
}

export const RecognitionFeed: FC<RecognitionFeedProps> = ({ items }) => (
  <div
    className="bg-base-200 border-base-content/10 w-full rounded-xl border p-4"
    data-testid="recognition-feed">
    <h3 className="mb-4 text-sm font-medium">Recent recognitions</h3>
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3">
          <div className="bg-neutral text-neutral-content flex h-9 w-9 shrink-0 items-center justify-center rounded-full">
            <span className="text-base">{item.badge ?? '⭐'}</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.from}</span>
              <span className="text-base-content/50"> recognized </span>
              <span className="font-medium">{item.to}</span>
            </p>
            <p className="text-base-content/70 text-sm">{item.message}</p>
            <p className="text-base-content/40 mt-0.5 text-xs">{item.time}</p>
          </div>
        </li>
      ))}
      {items.length === 0 && (
        <li className="text-base-content/40 text-center text-sm">
          No recognitions yet
        </li>
      )}
    </ul>
  </div>
);

RecognitionFeed.displayName = 'RecognitionFeed';
