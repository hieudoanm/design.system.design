'use client';

import type { FC } from 'react';
import { useState } from 'react';

interface NowPlayingBarProps {
  title: string;
  artist: string;
  albumArt?: string;
  progress?: number;
  playing?: boolean;
  onToggle?: (playing: boolean) => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export const NowPlayingBar: FC<NowPlayingBarProps> = ({
  title,
  artist,
  albumArt,
  progress = 0,
  playing = false,
  onToggle,
  onNext,
  onPrev,
}) => {
  const [isPlaying, setIsPlaying] = useState(playing);

  const handleToggle = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    onToggle?.(next);
  };

  return (
    <div
      data-testid="now-playing-bar"
      className="border-base-content/10 bg-base-200 flex items-center gap-4 border-t px-4 py-3">
      <div className="avatar">
        <div className="h-12 w-12 rounded-lg">
          {albumArt ? (
            <img src={albumArt} alt={title} />
          ) : (
            <div className="bg-primary text-primary-content flex h-full w-full items-center justify-center">
              ♪
            </div>
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        <p className="text-base-content/50 truncate text-xs">{artist}</p>
        <progress
          className="progress progress-primary h-1 w-full"
          value={progress}
          max={100}
        />
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Previous"
          className="btn btn-ghost btn-sm btn-circle"
          onClick={onPrev}>
          ⏮
        </button>
        <button
          type="button"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          className="btn btn-primary btn-circle btn-sm"
          onClick={handleToggle}>
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          type="button"
          aria-label="Next"
          className="btn btn-ghost btn-sm btn-circle"
          onClick={onNext}>
          ⏭
        </button>
      </div>
    </div>
  );
};

NowPlayingBar.displayName = 'NowPlayingBar';
