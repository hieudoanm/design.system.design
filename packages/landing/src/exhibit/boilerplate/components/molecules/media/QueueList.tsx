import type { FC } from 'react';

interface QueueTrack {
  id: string;
  title: string;
  artist: string;
  duration: string;
}

interface QueueListProps {
  tracks: QueueTrack[];
  currentId?: string;
  onSelect?: (id: string) => void;
}

export const QueueList: FC<QueueListProps> = ({
  tracks,
  currentId,
  onSelect,
}) => (
  <div className="flex flex-col" data-testid="queue-list">
    {tracks.map((track, index) => {
      const isCurrent = track.id === currentId;
      return (
        <button
          key={track.id}
          type="button"
          onClick={() => onSelect?.(track.id)}
          data-testid="queue-track"
          className={`flex items-center gap-3 px-4 py-2 text-left transition-colors ${
            isCurrent ? 'bg-primary/10' : 'hover:bg-base-200'
          }`}>
          <span className="text-base-content/50 w-6 text-center text-sm">
            {isCurrent ? '♪' : index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p
              className={`truncate text-sm ${
                isCurrent ? 'text-primary font-semibold' : ''
              }`}>
              {track.title}
            </p>
            <p className="text-base-content/50 truncate text-xs">
              {track.artist}
            </p>
          </div>
          <span className="text-base-content/50 text-xs">{track.duration}</span>
        </button>
      );
    })}
  </div>
);

QueueList.displayName = 'QueueList';
