'use client';

import { useState } from 'react';
import type { FC } from 'react';

interface LyricLine {
  id: string;
  time: number;
  text: string;
}

interface LyricsViewProps {
  lines: LyricLine[];
  activeIndex?: number;
  onSelect?: (index: number) => void;
}

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
};

export const LyricsView: FC<LyricsViewProps> = ({
  lines,
  activeIndex = 0,
  onSelect,
}) => {
  const [selected, setSelected] = useState(activeIndex);

  const selectLine = (index: number): void => {
    setSelected(index);
    onSelect?.(index);
  };

  return (
    <section data-testid="lyrics-view" className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">Lyrics</h2>
      {lines.length === 0 ? (
        <p className="text-base-content/50 text-sm">No lyrics available.</p>
      ) : (
        <ol className="flex flex-col gap-1">
          {lines.map((line, index) => {
            const isActive = index === selected;
            const classes = [
              'w-full rounded-lg px-3 py-2 text-left text-sm',
              isActive
                ? 'bg-base-200 font-medium text-primary'
                : 'text-base-content/60',
            ].join(' ');
            return (
              <li key={line.id}>
                <button
                  type="button"
                  className={classes}
                  aria-pressed={isActive}
                  data-testid={`lyric-${line.id}`}
                  onClick={() => selectLine(index)}>
                  <span className="text-base-content/40 mr-2 text-xs">
                    {formatTime(line.time)}
                  </span>
                  {line.text}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
