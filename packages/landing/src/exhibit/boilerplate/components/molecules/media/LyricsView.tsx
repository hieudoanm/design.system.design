import type { FC } from 'react';

interface LyricsViewProps {
  lines: string[];
  activeLine?: number;
}

export const LyricsView: FC<LyricsViewProps> = ({ lines, activeLine = -1 }) => (
  <div
    className="flex flex-col items-center gap-1 py-4"
    data-testid="lyrics-view">
    {lines.map((line, index) => (
      <p
        key={index}
        className={`text-center transition-colors ${
          index === activeLine
            ? 'text-primary font-semibold'
            : 'text-base-content/40'
        }`}>
        {line}
      </p>
    ))}
  </div>
);

LyricsView.displayName = 'LyricsView';
