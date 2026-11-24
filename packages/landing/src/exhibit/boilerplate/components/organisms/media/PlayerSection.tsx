'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface PlayerSectionProps {
  title: string;
  artist: string;
  duration?: number;
  progress?: number;
  onToggle?: (isPlaying: boolean) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

export const PlayerSection: FC<PlayerSectionProps> = ({
  title,
  artist,
  duration = 210,
  progress = 0,
  onToggle,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const toggle = (): void => {
    const next = !isPlaying;
    setIsPlaying(next);
    onToggle?.(next);
  };

  return (
    <section data-testid="player-section" className="card bg-base-200 w-full">
      <div className="card-body gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-accent/20 flex aspect-square w-16 items-center justify-center rounded-xl">
            <span className="text-2xl" aria-hidden="true">
              &#9835;
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="card-title text-base" data-testid="track-title">
              {title}
            </h3>
            <p className="text-base-content/60 text-sm">{artist}</p>
          </div>
          <button
            type="button"
            className="btn btn-primary btn-circle"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            data-testid="play-toggle"
            onClick={toggle}>
            {isPlaying ? '\u23F8' : '\u25B6'}
          </button>
        </div>
        <div>
          <progress
            className="progress progress-primary w-full"
            value={progress}
            max={duration}
          />
          <div className="text-base-content/60 flex justify-between text-xs">
            <span data-testid="elapsed">{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p
            className="text-base-content/50 text-xs"
            data-testid="player-state">
            {isPlaying ? 'Playing' : 'Paused'}
          </p>
          <button type="button" className="btn btn-ghost btn-sm">
            Skip &#187;
          </button>
        </div>
      </div>
    </section>
  );
};
