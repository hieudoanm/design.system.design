import type { FC } from 'react';

interface Item {
  id: string;
  title: string;
  artist: string;
  playedAt: string;
  coverUrl?: string;
}

interface RecentlyPlayedProps {
  items: Item[];
  onSelect?: (id: string) => void;
}

export const RecentlyPlayed: FC<RecentlyPlayedProps> = ({
  items,
  onSelect,
}) => (
  <div className="flex flex-col gap-2" data-testid="recently-played">
    {items.length === 0 && (
      <p className="text-base-content/50 text-sm">Nothing played yet.</p>
    )}
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        onClick={() => onSelect?.(item.id)}
        className="hover:bg-base-200 flex items-center gap-3 rounded-lg px-3 py-2 text-left">
        {item.coverUrl ? (
          <img
            src={item.coverUrl}
            alt={item.title}
            className="h-10 w-10 rounded-lg object-cover"
          />
        ) : (
          <div className="bg-base-content/10 flex h-10 w-10 items-center justify-center rounded-lg text-lg">
            ♪
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="text-base-content/50 truncate text-xs">{item.artist}</p>
        </div>
        <span className="text-base-content/50 shrink-0 text-xs">
          {item.playedAt}
        </span>
      </button>
    ))}
  </div>
);

RecentlyPlayed.displayName = 'RecentlyPlayed';
