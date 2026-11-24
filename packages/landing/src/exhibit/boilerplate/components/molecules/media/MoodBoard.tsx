import type { FC } from 'react';

interface Mood {
  id: string;
  label: string;
  emoji?: string;
}

interface MoodBoardProps {
  moods: Mood[];
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export const MoodBoard: FC<MoodBoardProps> = ({
  moods,
  selectedId,
  onSelect,
}) => (
  <div className="flex flex-wrap gap-2" data-testid="mood-board">
    {moods.map((mood) => {
      const selected = mood.id === selectedId;
      return (
        <button
          key={mood.id}
          type="button"
          onClick={() => onSelect?.(mood.id)}
          aria-pressed={selected}
          className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-outline'}`}>
          {mood.emoji && <span>{mood.emoji}</span>}
          {mood.label}
        </button>
      );
    })}
  </div>
);

MoodBoard.displayName = 'MoodBoard';
